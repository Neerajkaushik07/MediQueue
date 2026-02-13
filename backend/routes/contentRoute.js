import express from 'express';
import authUser from '../middlewares/authUser.js';

import {
    getHealthContent,
    getHealthContentBySlug,
    getFeaturedContent,
    getHealthTips,
    likeContent,
    bookmarkContent,
    getBookmarkedContent,
    getContentByCategory,
    shareContent,
    addHealthContent,
    updateHealthContent,
    deleteHealthContent
} from '../controllers/contentController.js';

const contentRouter = express.Router();

// Public routes
contentRouter.get('/content', getHealthContent);
contentRouter.get('/content/slug/:slug', getHealthContentBySlug);
contentRouter.get('/content/featured', getFeaturedContent);
contentRouter.get('/content/tips', getHealthTips);
contentRouter.get('/content/category/:category', getContentByCategory);

// User routes
contentRouter.post('/content/:contentId/like', authUser, likeContent);
contentRouter.post('/content/:contentId/bookmark', authUser, bookmarkContent);
contentRouter.get('/content/bookmarked', authUser, getBookmarkedContent);
contentRouter.post('/content/:contentId/share', shareContent);



export default contentRouter;
