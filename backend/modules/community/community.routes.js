import express from 'express';
import { addPost, getAllPosts, getUserPosts, addComment, getPostComments, likePost, voteComment } from './community.controller.js';
import authUser from '../../middlewares/authUser.js';
import authDoctor from '../../middlewares/authDoctor.js';
import upload from '../../middlewares/multer.js';

const communityRouter = express.Router();

// Public / Shared Routes
communityRouter.get('/list', getAllPosts);
communityRouter.post('/comments', getPostComments); // Get comments for a post

// User Authenticated Routes
communityRouter.post('/user/post', authUser, upload.single('image'), addPost);
communityRouter.post('/user/myposts', authUser, getUserPosts);
communityRouter.post('/user/comment', authUser, addComment);
communityRouter.post('/user/like', authUser, likePost);
communityRouter.post('/user/vote', authUser, voteComment);

// Doctor Authenticated Routes
communityRouter.post('/doctor/post', authDoctor, upload.single('image'), addPost);
communityRouter.post('/doctor/myposts', authDoctor, getUserPosts);
communityRouter.post('/doctor/comment', authDoctor, addComment);
communityRouter.post('/doctor/like', authDoctor, likePost);
communityRouter.post('/doctor/vote', authDoctor, voteComment);

export default communityRouter;