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
        const { senderId, senderType, receiverId, receiverType, roomId, text, messageType, imageUrl } = data;

        const newMessage = new Message({
          senderId,
          senderType,
          receiverId,
          receiverType,
          roomId,
          text: text || '',
          messageType: messageType || 'text',
          imageUrl,
          timestamp: new Date()
        });

        const savedMessage = await newMessage.save();

        io.to(roomId).emit('receive_message', {
          id: savedMessage._id,
          sender: savedMessage.senderType === 'Doctor' ? 'doctor' : 'patient',
          text: savedMessage.text,
          messageType: savedMessage.messageType,
          imageUrl: savedMessage.imageUrl,
          timestamp: savedMessage.timestamp,
          senderId: savedMessage.senderId,
          senderType: savedMessage.senderType,
          isDeleted: savedMessage.isDeleted,
        });

      } catch (error) {
        logger.error(`Error saving message: ${error.message}`);
      }
    });

    socket.on('delete_message', async (data) => {
      try {
        const { messageId, senderId, roomId } = data;

        const message = await Message.findById(messageId);

        // Ensure the sender owns the message or it's valid
        if (message && message.senderId === senderId) {
          message.isDeleted = true;
          await message.save();

          io.to(roomId).emit('message_deleted', {
            id: messageId
          });
        }
      } catch (error) {
        logger.error(`Error deleting message: ${error.message}`);
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
