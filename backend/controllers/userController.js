import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const users = await User.find(query)
    .select('-password -googleId')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -googleId');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (req.body.role && !['admin', 'viewer'].includes(req.body.role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be admin or viewer.'
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    req.body,
    { new: true, runValidators: true }
  ).select('-password -googleId');

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser
    },
    message: 'User updated successfully'
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  
  res.status(200).json({
    success: true,
    data: {
      totalUsers
    }
  });
});

export const getPublicUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  
  res.status(200).json({
    success: true,
    data: {
      totalUsers
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  ).select('-password -googleId');

  res.status(200).json({
    success: true,
    data: {
      user: updatedUser
    },
    message: 'Profile updated successfully'
  });
});
