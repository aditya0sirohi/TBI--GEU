const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Simple auth middleware using JWT in Authorization: Bearer <token>
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'dev_secret_change_me',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/users - return all usernames only
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, profilePicture: 1 });
    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/add-friend/:friendId - mutual friendship
router.post('/add-friend/:friendId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    if (userId === friendId) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add if not exists
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friend._id } },
      { new: true }
    );
    const updatedFriend = await User.findByIdAndUpdate(
      friendId,
      { $addToSet: { friends: user._id } },
      { new: true }
    );

    res.json({
      message: 'Friend added',
      user: { id: updatedUser._id, friends: updatedUser.friends },
      friend: { id: updatedFriend._id, friends: updatedFriend.friends },
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/check-friendship/:friendId - boolean
router.get('/check-friendship/:friendId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const user = await User.findById(userId).select('friends');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isFriend = user.friends?.some((f) => f.toString() === friendId);
    res.json({ isFriend: !!isFriend });
  } catch (error) {
    console.error('Check friendship error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


