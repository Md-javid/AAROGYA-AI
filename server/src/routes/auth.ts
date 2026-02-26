import express from 'express';
import { register, login, getMe, sendRegistrationOTP, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendRegistrationOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

export default router;
