const Order = require('../app/models/Order'); // Import model Order

function setupNotifySocketServer(server) {
  const io = require('socket.io')(server, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', async (message) => {
      io.emit('message', message);
      try {
        // Lấy dữ liệu từ database thay vì gọi API
        const dbData = await Order.find(); // Lấy tất cả các đơn hàng từ MongoDB
        
        io.emit('adminEvent', dbData); // Gửi dữ liệu đơn hàng đến client
      } catch (error) { 
        console.error('Error fetching data from order server:', error.message || error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

module.exports = setupNotifySocketServer;
