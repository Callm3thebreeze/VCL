class SessionToken {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.tokenHash = data.token_hash;
    this.expiresAt = data.expires_at;
    this.createdAt = data.created_at;
    this.isRevoked = data.is_revoked;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      isRevoked: this.isRevoked,
    };
  }

  // Check if token is expired
  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  // Check if token is valid (not expired and not revoked)
  isValid() {
    return !this.isExpired() && !this.isRevoked;
  }

  // Static method to create SessionToken from database row
  static fromDatabase(row) {
    return new SessionToken(row);
  }
}

module.exports = SessionToken;
