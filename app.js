const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const pg = require('pg');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const connectionString = 'postgresql://postgres:password@localhost:5432/chat_app_db';
const pool = new pg.Pool({
  connectionString: connectionString,
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  
    socket.on('chat message', (message) => {
      console.log('Message:', message);
  
      // Store the message in the database
      pool.query('INSERT INTO messages (text) VALUES ($1)', [message], (err, result) => {
        if (err) {
          console.error('Error inserting message:', err);
        }
      });
  
      // Broadcast the message to all connected clients
      io.emit('chat message', message);
    });
  });
  