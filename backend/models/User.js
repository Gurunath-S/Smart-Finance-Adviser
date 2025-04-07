const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userId: { type: String, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Automatically generate userId before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  if (!this.userId) {
    this.userId = `${this.username}-${Date.now()}`;
  }

  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
