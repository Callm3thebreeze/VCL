class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Get full name
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Static method to create User from database row
  static fromDatabase(row) {
    return new User(row);
  }
}

module.exports = User;
