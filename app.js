const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const socketio = require('socket.io');
const http = require('http');
const Document = require('./models/document-model');
const User = require('./models/user-model');

const db = require('./config/mongoose-config');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const indexRouter = require('./routes/index');
const documentRouter = require('./routes/documents');
const editorRouter = require('./routes/editor');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cookieParser());

// Session middleware for authentication
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/realtime-editor' }),
  cookie: { maxAge: 180 * 60 * 1000 }, // 3 hours session
}));

// Socket.io code
const activeDocuments = {}; // Store active document users

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinDocument', async (documentId) => {
    socket.join(documentId);
    console.log(`User joined document: ${documentId}`);

    // Load the document content
    const document = await Document.findById(documentId);
    if (document) {
      socket.emit('loadDocument', document.content);
      // Add user to the active document tracker
      if (!activeDocuments[documentId]) {
        activeDocuments[documentId] = [];
      }
      activeDocuments[documentId].push(socket.id);
      io.to(documentId).emit('userJoined', socket.id); // Notify others that a user joined
    }

    // Listen for document edits
    socket.on('editDocument', async (content) => {
      try {
        await Document.findByIdAndUpdate(documentId, { content });
        socket.to(documentId).emit('receiveChanges', content); // Broadcast changes to other users
      } catch (error) {
        console.error(`Error updating document: ${error}`);
      }
    });

    // Add these event listeners to your existing socket code
socket.on('userJoined', (userId) => {
  console.log(`User ${userId} joined the document.`);
  // Optionally update UI to show users
});

socket.on('userLeft', (userId) => {
  console.log(`User ${userId} left the document.`);
  // Optionally update UI to show users
});



    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove user from active document tracker
      if (activeDocuments[documentId]) {
        activeDocuments[documentId] = activeDocuments[documentId].filter(id => id !== socket.id);
        io.to(documentId).emit('userLeft', socket.id); // Notify others that a user left
      }
    });
  });
});





// Routes
app.use('/', indexRouter);
app.use('/documents', documentRouter);
app.use('/editor', editorRouter);

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
