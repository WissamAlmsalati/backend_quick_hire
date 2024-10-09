const User = require('../models/userModel');
const WalletTransaction = require('../models/walletModel');

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ walletBalance: user.wallet });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Error fetching wallet balance', error });
  }
};

// Add funds to wallet
exports.addFunds = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wallet += amount;
    await user.save();

    const transaction = new WalletTransaction({
      userId,
      type: 'credit',
      amount,
      description: 'Funds added to wallet'
    });
    await transaction.save();

    res.status(200).json({ message: 'Funds added successfully', walletBalance: user.wallet });
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    res.status(500).json({ message: 'Error adding funds to wallet', error });
  }
};

// Withdraw funds from wallet
exports.withdrawFunds = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wallet < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.wallet -= amount;
    await user.save();

    const transaction = new WalletTransaction({
      userId,
      type: 'debit',
      amount,
      description: 'Funds withdrawn from wallet'
    });
    await transaction.save();

    res.status(200).json({ message: 'Funds withdrawn successfully', walletBalance: user.wallet });
  } catch (error) {
    console.error('Error withdrawing funds from wallet:', error);
    res.status(500).json({ message: 'Error withdrawing funds from wallet', error });
  }
};