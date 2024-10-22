const WebSocket = require('ws');
const Order = require('../app/models/Order')

function setupWebSocketServer(server) {
  const io = require('socket.io')(server,{
    cors: {origin: "*"}
  }) 

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', async (message) => {
      io.emit('message',message)
      try {
        const dbData = await Order.find();
        
        io.emit('adminEvent', dbData)
      } catch (error) {
        console.error('Error fetching data from database:', error);
      }

    });

    socket.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

module.exports = setupWebSocketServer;
