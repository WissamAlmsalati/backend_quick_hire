require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Chat = require('./models/chatModel'); // Import the Chat model
const User = require('./models/userModel'); // Import the User model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

const clientRoutes = require('./routes/clientRoutes');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Import chat routes

app.use('/api/clients', clientRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/chats', chatRoutes); // Use chat routes

// Serve the freelancer.html file
app.get('/freelancer', (req, res) => {
  res.sendFile(path.join(__dirname, 'freelancer.html'));
});

// Serve the client.html file
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', async ({ jobId, userId }) => {
    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid jobId or userId');
      return;
    }

    socket.join(jobId);
    socket.userId = userId; // Store the userId in the socket session
    console.log(`User ${userId} joined room ${jobId}`);

    // Fetch previous chat messages for the room
    const messages = await Chat.find({ jobId }).sort({ createdAt: 1 });
    socket.emit('previousMessages', messages);
  });

  socket.on('sendMessage', async ({ jobId, sender, message }) => {
    try {
      const receiver = jobId; // Use jobId as the receiver ID

      // Fetch the username from the database using the userId
      const user = await User.findById(sender);
      if (!user) {
        throw new Error('User not found');
      }

      const chatMessage = new Chat({
        jobId: new mongoose.Types.ObjectId(jobId),
        sender: new mongoose.Types.ObjectId(sender),
        receiver: new mongoose.Types.ObjectId(receiver),
        message,
        username: user.username // Include the username in the message
      });
      await chatMessage.save();
      io.to(jobId).emit('receiveMessage', { ...chatMessage.toObject(), username: user.username });
    } catch (error) {
      console.error('Error saving chat message:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001; // Changed port to 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});