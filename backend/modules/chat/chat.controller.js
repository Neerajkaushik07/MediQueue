import Message from './chat.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const getHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadImage = async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

    res.status(200).json({
      success: true,
      imageUrl: imageUpload.secure_url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
