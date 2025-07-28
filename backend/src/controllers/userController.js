const userService = require('../services/userService');
const { validateRequest } = require('../middleware/validation');
const {
  updateUserSchema,
  changePasswordSchema,
} = require('../schemas/validationSchemas');

class UserController {
  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async getProfile(req, res, next) {
    try {
      res.json(req.user.toJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *                 example: John
   *               lastName:
   *                 type: string
   *                 example: Doe
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async updateProfile(req, res, next) {
    try {
      const updatedUser = await userService.updateUser(req.user.id, req.body);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/change-password:
   *   put:
   *     summary: Change user password
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 example: OldPass123!
   *               newPassword:
   *                 type: string
   *                 minLength: 8
   *                 example: NewPass123!
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Validation error or incorrect current password
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      await userService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.json({
        message:
          'Password changed successfully. Please log in again with your new password.',
      });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          error: 'Password change failed',
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/deactivate:
   *   delete:
   *     summary: Deactivate user account
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Account deactivated successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async deactivateAccount(req, res, next) {
    try {
      await userService.deactivateUser(req.user.id);

      res.json({
        message: 'Account deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

const userController = new UserController();

// Apply validation middleware to methods
userController.updateProfile = [
  validateRequest(updateUserSchema),
  userController.updateProfile.bind(userController),
];

userController.changePassword = [
  validateRequest(changePasswordSchema),
  userController.changePassword.bind(userController),
];

module.exports = userController;
