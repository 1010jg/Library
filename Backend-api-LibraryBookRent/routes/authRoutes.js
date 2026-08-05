const express = require('express');
const { registerUser, loginUser, getProfile, createGuestUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/guest', createGuestUser);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
