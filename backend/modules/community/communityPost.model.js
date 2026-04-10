import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userType: { type: String, required: true, enum: ['user', 'doctor', 'admin'] }, // Type of user who posted
    authorName: { type: String, required: true },
    authorImage: { type: String, default: '' },
    speciality: { type: String, default: '' }, // For doctors
    content: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    imageUrl: { type: String, default: '' },
    likes: { type: Array, default: [] }, // Array of user IDs who liked
    createdAt: { type: Number, default: Date.now }
}, { minimize: false });

const communityPostModel = mongoose.models.communityPost || mongoose.model("communityPost", communityPostSchema);

export default communityPostModel;