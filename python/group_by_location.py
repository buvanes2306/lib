import json
from collections import defaultdict

# Load the exported data
with open('D:/lib/python/exported_data.json', 'r') as f:
    books = json.load(f)

# Group books by location
grouped_books = defaultdict(list)

for book in books:
    location = book.get('location', {})
    rack = location.get('rack')
    shelf = location.get('shelf')
    
    # Handle null/None values
    if rack is None and shelf is None:
        location_key = "Unknown Location"
    else:
        location_key = f"Rack {rack} - Shelf {shelf}"
    
    grouped_books[location_key].append({
        'bookId': book.get('bookId'),
        'title': book.get('title'),
        'authors': book.get('authors'),
        'department': book.get('department'),
        'status': book.get('status'),
        'rack': rack,
        'shelf': shelf
    })

# Sort books within each location by bookId
for location_key in grouped_books:
    grouped_books[location_key].sort(key=lambda x: x['bookId'])

# Display the grouped results
print("=" * 80)
print("BOOKS GROUPED BY LOCATION (Ordered by BookId)")
print("=" * 80)

# Sort by location key for better readability
for location_key in sorted(grouped_books.keys()):
    books_in_location = grouped_books[location_key]
    print(f"\n📍 {location_key} ({len(books_in_location)} books)")
    print("-" * 60)
    for book in books_in_location:
        print(f"   • {book['bookId']}: {book['title'][:50]}... | {book['department']}")

# Save to JSON file ordered by location and bookId
output_data = {}
for location_key in sorted(grouped_books.keys()):
    output_data[location_key] = sorted(grouped_books[location_key], key=lambda x: x['bookId'])

with open('D:/lib/python/books_grouped_by_location.json', 'w') as f:
    json.dump(output_data, f, indent=2)

print("\n" + "=" * 80)
print(f"Total unique locations: {len(grouped_books)}")
print(f"Total books: {len(books)}")
print("Results saved to: books_grouped_by_location.json")

