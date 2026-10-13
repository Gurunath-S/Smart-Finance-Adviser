const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userId: { type: String, unique: true },
    password: {
      type: String,
      required: function () {
        return this.authProvider !== 'google';
      },
    },
    googleId: { type: String, sparse: true, unique: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    cashDenominations: {
      notes: {
        n500: { type: Number, default: 0 },
        n200: { type: Number, default: 0 },
        n100: { type: Number, default: 0 },
        n50: { type: Number, default: 0 },
        n20: { type: Number, default: 0 },
        n10: { type: Number, default: 0 },
      },
      coins: {
        c20: { type: Number, default: 0 },
        c10: { type: Number, default: 0 },
        c5: { type: Number, default: 0 },
        c2: { type: Number, default: 0 },
        c1: { type: Number, default: 0 },
      },
      omittedAmount: { type: Number, default: 0 },
      isOmittedActive: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Standard 10 bcrypt salt rounds for secure password hashing
const SALT_ROUNDS = 10;

// Automatically generate userId and hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.userId) {
    this.userId = `${this.username}-${Date.now()}`;
  }

  if (!this.password || !this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
