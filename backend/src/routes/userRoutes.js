const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.delete('/deactivate', userController.deactivateAccount);

module.exports = router;
