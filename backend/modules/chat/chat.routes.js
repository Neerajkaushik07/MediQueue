import express from 'express';
import { getHistory } from './chat.controller.js';

const chatRouter = express.Router();

chatRouter.get('/history/:roomId', getHistory);

export default chatRouter;
