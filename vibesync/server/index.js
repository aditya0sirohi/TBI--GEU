require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const songsRouter = require('./routes/songs');
const aiRouter = require('./routes/ai');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/songs', songsRouter);
app.use('/api/ai', aiRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'Server is vibing!' });
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI is not set in environment variables.');
} else {
  mongoose
    .connect(mongoUri, { dbName: process.env.MONGO_DB || undefined })
    .then(() => {
      console.log('Connected to MongoDB successfully');
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
    });
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


