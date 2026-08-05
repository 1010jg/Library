const express = require('express');
const router = express.Router();

const { 
  createRental, 
  createGuestRental, 
  returnRental, 
  getUserRentals, 
  getAllRentals 
} = require('../controllers/rentalController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createRental);
router.post('/guest', createGuestRental);
router.post('/:id/return', authMiddleware, returnRental);
router.get('/my', authMiddleware, getUserRentals);
router.get('/', authMiddleware, getAllRentals);

module.exports = router;