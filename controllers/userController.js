const User = require('../models/userModel');

// Get user information by ID

exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};
exports.updateUserProfile = async (req,res) => {
    const userId = req.params.id;
    const updates = req.body;
    console.log(`recived userId:${userId} for updates`);

    try{
        const user = await User.findByIdAndUpdate(userId,updates,{new:true , runValidators:true}).select('-password');
        if(!user){
            return res.status(404).json({message:'User Not Found'});
        }
        res.status(200).json(user);
    }catch(error){
        console.error('error updating user',error);
        res.status(500).json({message:"server error",error})
    }
}