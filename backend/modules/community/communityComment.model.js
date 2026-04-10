import mongoose from "mongoose";

const communityCommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'communityPost', required: true },
    userId: { type: String, required: true },
    userType: { type: String, required: true, enum: ['user', 'doctor', 'admin'] },
    authorName: { type: String, required: true },
    authorImage: { type: String, default: '' },
    speciality: { type: String, default: '' }, // For doctors
    content: { type: String, required: true },
    upvotes: { type: Array, default: [] }, // User IDs
    downvotes: { type: Array, default: [] }, // User IDs
    createdAt: { type: Number, default: Date.now }
}, { minimize: false });

const communityCommentModel = mongoose.models.communityComment || mongoose.model("communityComment", communityCommentSchema);

export default communityCommentModel;