import healthContentModel from "../models/healthContentModel.js";
import logger from '../config/logger.js';

// Get all health content
const getHealthContent = async (req, res) => {
    try {
        const { category, contentType, search } = req.query;

        let query = { isPublished: true };

        if (category) {
            query.category = category;
        }

        if (contentType) {
            query.contentType = contentType;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const content = await healthContentModel.find(query)
            .sort({ publishedDate: -1 })
            .select('-content'); // Don't send full content in list view

        res.json({ success: true, content });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single health content by slug
const getHealthContentBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const content = await healthContentModel.findOneAndUpdate(
            { slug, isPublished: true },
            { $inc: { views: 1 } },
            { new: true }
        ).populate('relatedArticles', 'title slug category featuredImage readTime');

        if (!content) {
            return res.json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, content });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get featured content
const getFeaturedContent = async (req, res) => {
    try {
        const content = await healthContentModel.find({
            isPublished: true,
            isFeatured: true
        })
            .sort({ publishedDate: -1 })
            .limit(10)
            .select('-content');

        res.json({ success: true, content });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get health tips
const getHealthTips = async (req, res) => {
    try {
        const tips = await healthContentModel.find({
            contentType: 'tip',
            isPublished: true
        })
            .sort({ publishedDate: -1 })
            .limit(20)
            .select('title summary category tags featuredImage');

        res.json({ success: true, tips });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Like content
const likeContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.body.userId;

        const content = await healthContentModel.findById(contentId);

        if (!content) {
            return res.json({ success: false, message: 'Content not found' });
        }

        const alreadyLiked = content.likedBy.includes(userId);

        if (alreadyLiked) {
            // Unlike
            content.likedBy = content.likedBy.filter(id => id.toString() !== userId);
            content.likes -= 1;
        } else {
            // Like
            content.likedBy.push(userId);
            content.likes += 1;
        }

        await content.save();

        res.json({
            success: true,
            message: alreadyLiked ? 'Content unliked' : 'Content liked',
            liked: !alreadyLiked
        });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Bookmark content
const bookmarkContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.body.userId;

        const content = await healthContentModel.findById(contentId);

        if (!content) {
            return res.json({ success: false, message: 'Content not found' });
        }

        const alreadyBookmarked = content.bookmarkedBy.includes(userId);

        if (alreadyBookmarked) {
            // Remove bookmark
            content.bookmarkedBy = content.bookmarkedBy.filter(id => id.toString() !== userId);
        } else {
            // Add bookmark
            content.bookmarkedBy.push(userId);
        }

        await content.save();

        res.json({
            success: true,
            message: alreadyBookmarked ? 'Bookmark removed' : 'Content bookmarked',
            bookmarked: !alreadyBookmarked
        });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get bookmarked content
const getBookmarkedContent = async (req, res) => {
    try {
        const userId = req.body.userId;

        const content = await healthContentModel.find({
            bookmarkedBy: userId,
            isPublished: true
        })
            .sort({ createdAt: -1 })
            .select('-content');

        res.json({ success: true, content });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get content by category
const getContentByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const content = await healthContentModel.find({
            category,
            isPublished: true
        })
            .sort({ publishedDate: -1 })
            .select('-content');

        res.json({ success: true, content });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Share content (increment share count)
const shareContent = async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await healthContentModel.findByIdAndUpdate(
            contentId,
            { $inc: { shares: 1 } },
            { new: true }
        );

        if (!content) {
            return res.json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, message: 'Content shared successfully' });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Add health content
const addHealthContent = async (req, res) => {
    try {
        const { title, slug, contentType, category, content, summary, featuredImage, videoUrl, author, tags, keywords, readTime, difficulty, isPublished, isFeatured } = req.body;

        const newContent = new healthContentModel({
            title,
            slug,
            contentType,
            category,
            content,
            summary,
            featuredImage,
            videoUrl,
            author,
            tags,
            keywords,
            readTime,
            difficulty,
            isPublished,
            isFeatured
        });

        await newContent.save();
        res.json({ success: true, message: 'Content added successfully', content: newContent });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update health content
const updateHealthContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const updateData = req.body;

        const updatedContent = await healthContentModel.findByIdAndUpdate(
            contentId,
            { ...updateData, lastUpdated: Date.now() },
            { new: true }
        );

        if (!updatedContent) {
            return res.json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, message: 'Content updated successfully', content: updatedContent });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete health content
const deleteHealthContent = async (req, res) => {
    try {
        const { contentId } = req.params;

        const deletedContent = await healthContentModel.findByIdAndDelete(contentId);

        if (!deletedContent) {
            return res.json({ success: false, message: 'Content not found' });
        }

        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        logger.error(error);
        res.json({ success: false, message: error.message });
    }
};



export {
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
};
