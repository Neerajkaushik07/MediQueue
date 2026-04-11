import express from 'express';
import { getHistory, uploadImage } from './chat.controller.js';
import upload from '../../middlewares/multer.js';

const chatRouter = express.Router();

chatRouter.get('/history/:roomId', getHistory);
chatRouter.post('/upload-image', upload.single('image'), uploadImage);

export default chatRouter;
