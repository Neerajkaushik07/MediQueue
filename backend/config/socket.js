import { Server } from 'socket.io';
import Message from '../modules/chat/chat.model.js';
import logger from './logger.js';

let io;

export const socketInit = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`User connected to socket: ${socket.id}`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      logger.info(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderId, senderType, receiverId, receiverType, roomId, text } = data;
        
        const newMessage = new Message({
          senderId,
          senderType,
          receiverId,
          receiverType,
          roomId,
          text,
          timestamp: new Date()
        });
        
        const savedMessage = await newMessage.save();

        io.to(roomId).emit('receive_message', {
            id: savedMessage._id,
            sender: savedMessage.senderType === 'Doctor' ? 'doctor' : 'patient',
            text: savedMessage.text,
            timestamp: savedMessage.timestamp,
            senderId: savedMessage.senderId,
        });
        
      } catch (error) {
        logger.error(`Error saving message: ${error.message}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
