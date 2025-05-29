const express = require('express');
const { register, login } = require('../controllers/authController');
//const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
console.log('Type of authMiddleware:', typeof authMiddleware);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation or duplicate email error
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       400:
 *         description: Validation error or invalid credentials
 *       500:
 *         description: Server error
 */
router.post(
  '/login',
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password is required').notEmpty(),
  ],
  login
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    id: req.user.userId,
    email: req.user.email,
  });
});

module.exports = router;
