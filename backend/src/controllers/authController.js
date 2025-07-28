const userService = require('../services/userService');
const { validateRequest } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../schemas/validationSchemas');

class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: SecurePass123!
   *               firstName:
   *                 type: string
   *                 example: John
   *               lastName:
   *                 type: string
   *                 example: Doe
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *                 token:
   *                   type: string
   *       400:
   *         description: Validation error or user already exists
   *       500:
   *         description: Internal server error
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Registration failed',
          message: 'User with this email already exists',
        });
      }

      // Create new user
      const user = await userService.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      // Generate token
      const token = await userService.generateToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: SecurePass123!
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *                 token:
   *                   type: string
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Internal server error
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Authenticate user
      const user = await userService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = await userService.generateToken(user.id);

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async logout(req, res, next) {
    try {
      // Revoke the current token
      await userService.revokeToken(req.token);

      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/logout-all:
   *   post:
   *     summary: Logout from all devices
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logged out from all devices
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async logoutAll(req, res, next) {
    try {
      // Revoke all tokens for the user
      await userService.revokeAllUserTokens(req.user.id);

      res.json({
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get current user information
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async getCurrentUser(req, res, next) {
    try {
      res.json(req.user.toJSON());
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();

// Apply validation middleware to methods
authController.register = [
  validateRequest(registerSchema),
  authController.register.bind(authController),
];

authController.login = [
  validateRequest(loginSchema),
  authController.login.bind(authController),
];

module.exports = authController;
