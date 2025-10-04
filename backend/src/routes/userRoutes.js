const express = require('express');
const { registerAgent, registerCompany, login, getMe, updateMe, deleteMe, getUsers, getUser, updateUser, deleteUser, updateUserType, setUserType, getAllAgents, getTopAgents, forgotPassword, resetPassword } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes (no authentication required)
router.post('/registerAgent', registerAgent);
router.post('/registerCompany', registerCompany);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/all-agents', getAllAgents);
router.get('/all-companies', require('../controllers/userController').getAllCompanies);
router.get('/top-agents', getTopAgents);

// Protected routes (authentication required)
router.use(protect);

// User profile routes (authenticated users)
router.get('/me', getMe);
router.patch(
  '/updateMe',
  upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadharCardFront', maxCount: 1 },
    { name: 'aadharCardBack', maxCount: 1 }
  ]),
  updateMe
);
router.delete('/deleteMe', deleteMe);

// User type management (authenticated users)
router.post('/updateUserType', updateUserType);
router.post('/set-type', setUserType);

// Company and admin routes
router.get('/', getUsers);

// Admin-only routes
router.use(restrictTo('admin'));
router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router; 