import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  senderType: {
    type: String,
    enum: ['User', 'Doctor'],
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  receiverType: {
    type: String,
    enum: ['User', 'Doctor'],
    required: true,
  },
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  text: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
