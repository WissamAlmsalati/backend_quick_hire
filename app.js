const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const userRoute = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const WebSocket = require('ws');
const Chat = require('./models/chatModel'); // Assume Chat is your Mongoose model for chat messages
const User = require('./models/userModel'); // Assume User is your Mongoose model for users


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const clientRoutes = require('./routes/clientRoutes');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/clients', clientRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoute);
app.use('/api/categories', categoryRoutes);
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the freelancer.html file
app.get('/freelancer', (req, res) => {
  res.sendFile(path.join(__dirname, 'freelancer.html'));
});

// Serve the client.html file
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the application if MongoDB connection fails
  });


  // Initialize WebSocket Server
  const wss = new WebSocket.Server({ port: 8080 });
  
// Inside your WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (data) => {
    const parsedData = JSON.parse(data);

    // User joining a chat room
    if (parsedData.event === 'joinRoom') {
      const { jobId, userId } = parsedData;

      // Validate userId and jobId
      if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(userId)) {
        ws.send(JSON.stringify({ error: 'Invalid jobId or userId' }));
        return;
      }

      // Store userId and jobId in the WebSocket session
      ws.userId = userId;
      ws.jobId = jobId;

      console.log(`User ${ws.userId} joined room ${ws.jobId}`);

      // Fetch previous messages from the database
      try {
        const messages = await Chat.find({ jobId }).sort({ createdAt: 1 });
        ws.send(JSON.stringify({ event: 'previousMessages', messages }));
      } catch (error) {
        console.error('Error fetching chat messages:', error.message);
        ws.send(JSON.stringify({ error: 'Error fetching chat messages' }));
      }
    }

    // Handle sending a message
    if (parsedData.event === 'sendMessage') {
      const { jobId, sender, message } = parsedData;

      try {
        const user = await User.findById(sender);
        if (!user) {
          ws.send(JSON.stringify({ error: 'User not found' }));
          return;
        }

        const chatMessage = new Chat({
          jobId: new mongoose.Types.ObjectId(jobId),
          sender: new mongoose.Types.ObjectId(sender),
          message,
          username: user.username,
        });

        await chatMessage.save();

        // Broadcast the message to all users in the same job room
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.jobId === jobId) {
            client.send(JSON.stringify({
              event: 'receiveMessage',
              message: {
                jobId,
                sender: sender,
                message,
                username: user.username,
              },
            }));
          }
        });

      } catch (error) {
        console.error('Error saving chat message:', error.message);
        ws.send(JSON.stringify({ error: 'Error saving chat message' }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

  console.log('WebSocket server is running on ws://localhost:8080');
  

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});