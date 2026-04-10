import communityPostModel from "./communityPost.model.js";
import communityCommentModel from "./communityComment.model.js";
import userModel from "../user/user.model.js";
import doctorModel from "../doctor/doctor.model.js";
import { v2 as cloudinary } from "cloudinary";

// Helper to get user/doctor details
const getAuthorDetails = async (id, type) => {
    if (type === 'doctor') {
        const doc = await doctorModel.findById(id);
        return {
            name: doc.name,
            image: doc.image,
            speciality: doc.speciality
        };
    } else {
        const user = await userModel.findById(id);
        return {
            name: user.name,
            image: user.image,
            speciality: ''
        };
    }
}

// Add Post
const addPost = async (req, res) => {
    try {
        const { userId, docId, content, category } = req.body;
        const imageFile = req.file;

        let authorId, userType, authorDetails;

        if (docId) {
            authorId = docId;
            userType = 'doctor';
        } else {
            authorId = userId;
            userType = 'user';
        }

        authorDetails = await getAuthorDetails(authorId, userType);

        let imageUrl = "";
        if (imageFile) {
            const uploadResult = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = uploadResult.secure_url;
        }

        const newPost = new communityPostModel({
            userId: authorId,
            userType,
            authorName: authorDetails.name,
            authorImage: authorDetails.image,
            speciality: authorDetails.speciality,
            content,
            category,
            imageUrl
        });

        await newPost.save();

        res.json({ success: true, message: "Post Created Successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// List Posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await communityPostModel.find({}).sort({ createdAt: -1 });
        
        // Enhance posts with their comments count? (Optional if simple)
        // For now, return posts as is.
        res.json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get User/Doctor Posts
const getUserPosts = async (req, res) => {
    try {
        const { userId, docId } = req.body;
        const id = userId || docId;
        
        const posts = await communityPostModel.find({ userId: id }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


// Add Comment
const addComment = async (req, res) => {
    try {
        const { userId, docId, postId, content } = req.body;

        let authorId, userType, authorDetails;
        if (docId) {
            authorId = docId;
            userType = 'doctor';
        } else {
            authorId = userId;
            userType = 'user';
        }

        authorDetails = await getAuthorDetails(authorId, userType);

        const newComment = new communityCommentModel({
            postId,
            userId: authorId,
            userType,
            authorName: authorDetails.name,
            authorImage: authorDetails.image,
            speciality: authorDetails.speciality,
            content
        });

        await newComment.save();
        res.json({ success: true, message: "Comment Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get Post Comments
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.body; // or req.params if GET
        // But for GET request via body is tricky in some clients/proxies, usually params.
        // I will use req.params in route, but here let's support body too just in case.
        // Standard is params for GET.
        
        // Wait, route will be POST for fetching filtered data often in this project style or straightforward GET.
        // Let's assume POST for simplicity or params.
        
        const comments = await communityCommentModel.find({ postId }).sort({ createdAt: 1 });
        res.json({ success: true, comments });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Like Post Toggle
const likePost = async (req, res) => {
    try {
        const { userId, docId, postId } = req.body;
        const id = userId || docId;
        const userType = docId ? 'doctor' : 'user';

        const post = await communityPostModel.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "Post not found" });
        }

        if (post.likes.includes(id)) {
            post.likes = post.likes.filter(uid => uid !== id);
            await post.save();
            return res.json({ success: true, message: "Unliked" });
        } else {
            post.likes.push(id);
            await post.save();
            return res.json({ success: true, message: "Liked" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Vote Comment
const voteComment = async (req, res) => {
    try {
        const { userId, docId, commentId, voteType } = req.body; // voteType: 'up' or 'down'
        const id = userId || docId;

        const comment = await communityCommentModel.findById(commentId);
        if (!comment) {
            return res.json({ success: false, message: "Comment not found" });
        }

        // Check current status
        const isUpvoted = comment.upvotes.includes(id);
        const isDownvoted = comment.downvotes.includes(id);

        // Remove existing votes first
        if (isUpvoted) {
            comment.upvotes = comment.upvotes.filter(uid => uid !== id);
        }
        if (isDownvoted) {
            comment.downvotes = comment.downvotes.filter(uid => uid !== id);
        }

        // Add new vote only if it wasn't the same vote (toggle logic)
        if (voteType === 'up' && !isUpvoted) {
            comment.upvotes.push(id);
        } else if (voteType === 'down' && !isDownvoted) {
            comment.downvotes.push(id);
        }

        await comment.save();
        res.json({ success: true, message: "Vote Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addPost, getAllPosts, getUserPosts, addComment, getPostComments, likePost, voteComment };