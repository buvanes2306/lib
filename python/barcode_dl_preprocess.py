import base64
import json
import os
import sys
from typing import List, Set, Tuple

import cv2
import numpy as np

try:
    from pyzbar.pyzbar import decode as zbar_decode
except Exception:
    zbar_decode = None


MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "FSRCNN_x2.pb")


def read_input() -> dict:
    raw = sys.stdin.read()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def decode_base64_image(image_base64: str):
    if not image_base64:
        return None

    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception:
        return None

    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def try_super_resolution(image: np.ndarray):
    if not os.path.exists(MODEL_PATH):
        return None

    try:
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(MODEL_PATH)
        sr.setModel("fsrcnn", 2)
        return sr.upsample(image)
    except Exception:
        return None


def enhance_for_barcode(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, 7, 50, 50)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast = clahe.apply(denoised)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
    sharpened = cv2.filter2D(contrast, -1, kernel)
    _, binary = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return binary


def decode_codes(image: np.ndarray) -> List[str]:
    if zbar_decode is None:
        return []
    results = zbar_decode(image)
    codes = []
    for item in results:
        try:
            text = item.data.decode("utf-8").strip()
        except Exception:
            text = str(item.data).strip()
        if text:
            codes.append(text.upper())
    return sorted(list(set(codes)))


def collect_decode_variants(image: np.ndarray) -> List[np.ndarray]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, 7, 50, 50)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast = clahe.apply(denoised)

    variants = [gray, denoised, contrast]
    for threshold in (80, 110, 140, 170):
        _, binary = cv2.threshold(contrast, threshold, 255, cv2.THRESH_BINARY)
        variants.append(binary)
        variants.append(255 - binary)

    adaptive = cv2.adaptiveThreshold(
        contrast,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        6,
    )
    variants.append(adaptive)
    variants.append(255 - adaptive)
    return variants


def decode_with_rotations(image: np.ndarray, angles: Tuple[int, ...] = (0, -15, -8, 8, 15, -90, 90)) -> Set[str]:
    found: Set[str] = set()
    h, w = image.shape[:2]
    center = (w // 2, h // 2)

    for angle in angles:
        if angle == 0:
            rotated = image
        else:
            matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            cos = abs(matrix[0, 0])
            sin = abs(matrix[0, 1])
            new_w = int((h * sin) + (w * cos))
            new_h = int((h * cos) + (w * sin))
            matrix[0, 2] += (new_w / 2) - center[0]
            matrix[1, 2] += (new_h / 2) - center[1]
            rotated = cv2.warpAffine(image, matrix, (new_w, new_h), borderValue=(255, 255, 255))

        for variant in collect_decode_variants(rotated):
            decoded = decode_codes(variant)
            if decoded:
                found.update(decoded)

    return found


def detect_label_like_rois(image: np.ndarray) -> List[np.ndarray]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 40, 120)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    h, w = gray.shape[:2]
    image_area = h * w
    boxes = []

    for contour in contours:
        x, y, cw, ch = cv2.boundingRect(contour)
        area = cw * ch
        if area < image_area * 0.002 or area > image_area * 0.25:
            continue
        if cw < 80 or ch < 30:
            continue
        ratio = cw / max(ch, 1)
        if ratio < 1.2 or ratio > 8.0:
            continue

        pad_x = int(cw * 0.08)
        pad_y = int(ch * 0.1)
        x1 = max(x - pad_x, 0)
        y1 = max(y - pad_y, 0)
        x2 = min(x + cw + pad_x, w)
        y2 = min(y + ch + pad_y, h)
        boxes.append((x1, y1, x2, y2))

    # NMS-style dedupe by overlap instead of size (labels often share same size).
    boxes.sort(key=lambda b: (b[2] - b[0]) * (b[3] - b[1]), reverse=True)
    kept = []
    for box in boxes:
        bx1, by1, bx2, by2 = box
        b_area = max(1, (bx2 - bx1) * (by2 - by1))
        overlap_found = False
        for kx1, ky1, kx2, ky2 in kept:
            ix1 = max(bx1, kx1)
            iy1 = max(by1, ky1)
            ix2 = min(bx2, kx2)
            iy2 = min(by2, ky2)
            iw = max(0, ix2 - ix1)
            ih = max(0, iy2 - iy1)
            inter = iw * ih
            if inter <= 0:
                continue
            k_area = max(1, (kx2 - kx1) * (ky2 - ky1))
            iou = inter / float(b_area + k_area - inter)
            if iou > 0.45:
                overlap_found = True
                break
        if not overlap_found:
            kept.append(box)
        if len(kept) >= 200:
            break

    rois: List[np.ndarray] = []
    for x1, y1, x2, y2 in kept:
        rois.append(image[y1:y2, x1:x2])
    return rois


def process_image(image: np.ndarray) -> Tuple[List[str], str]:
    found: Set[str] = set()

    # 1) Full image with rotation + threshold sweeps
    found.update(decode_with_rotations(image))
    if found:
        return sorted(found), "full_rotations"

    # 2) Classical enhancement route
    enhanced = enhance_for_barcode(image)
    for variant in collect_decode_variants(cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)):
        found.update(decode_codes(variant))
    if found:
        return sorted(found), "enhanced_variants"

    # 3) Optional DL super-resolution + enhancements
    super_res = try_super_resolution(image)
    if super_res is not None:
        found.update(decode_with_rotations(super_res, (0, -8, 8, -90, 90)))
        if found:
            return sorted(found), "dl_superres"

    # 4) Contour-based label ROI decoding (best for sticker sheets)
    rois = detect_label_like_rois(image)
    for roi in rois:
        found.update(decode_with_rotations(roi, (0, -10, 10, -90, 90)))
        if len(found) >= 20:
            break
    if found:
        return sorted(found), "roi_contours"

    return [], "none"


def main():
    payload = read_input()
    image = decode_base64_image(payload.get("imageBase64", ""))

    if image is None:
        print(json.dumps({"success": False, "codes": [], "methodUsed": "invalid_image"}))
        return

    codes, method = process_image(image)
    print(json.dumps({"success": True, "codes": codes, "methodUsed": method}))


if __name__ == "__main__":
    main()
