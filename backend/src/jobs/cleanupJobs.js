const userService = require('../src/services/userService');

/**
 * Clean up expired session tokens
 * This job should be run periodically (e.g., daily)
 */
const cleanupExpiredTokens = async () => {
  try {
    console.log('Starting cleanup of expired tokens...');
    const deletedCount = await userService.cleanupExpiredTokens();
    console.log(`Cleanup completed. Deleted ${deletedCount} expired tokens.`);
  } catch (error) {
    console.error('Error during token cleanup:', error);
  }
};

module.exports = {
  cleanupExpiredTokens,
};
