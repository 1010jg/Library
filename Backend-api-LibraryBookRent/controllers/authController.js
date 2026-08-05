const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '7d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      memberType: 'registered',
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        memberType: user.memberType,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while registering user.' });
  }
};

const createGuestUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required for guest borrower.' });
    }

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered.' });
      }
    }

    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone: phone || '',
      memberType: 'guest',
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberType: user.memberType,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating guest borrower.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.memberType !== 'registered') {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        memberType: user.memberType,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      memberType: req.user.memberType,
      isAdmin: req.user.isAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

module.exports = { registerUser, loginUser, getProfile, createGuestUser };
