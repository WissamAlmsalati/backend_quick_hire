const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['client', 'freelancer', 'superuser'], default: 'client' }, // Add superuser to userType
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActiveProject' }],
  oldProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OldProject' }],
  wallet: { type: Number, default: 0 } // Add wallet field
});
// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, userType: this.userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const User = mongoose.model('User', userSchema);

module.exports = User;