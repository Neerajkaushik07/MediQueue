import mongoose from "mongoose";

const healthContentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    contentType: {
        type: String,
        enum: ['article', 'tip', 'video', 'infographic', 'podcast'],
        required: true
    },
    category: {
        type: String,
        enum: ['nutrition', 'fitness', 'mental_health', 'disease_prevention', 'lifestyle', 'pregnancy', 'child_care', 'senior_care', 'general'],
        required: true
    },

    content: { type: String, required: true },
    summary: { type: String, required: true },

    // Media
    featuredImage: { type: String },
    videoUrl: { type: String },

    // Author information
    author: {
        name: { type: String },
        credentials: { type: String },
        bio: { type: String }
    },

    // SEO and discovery
    tags: [{ type: String }],
    keywords: [{ type: String }],

    // Engagement metrics
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // User interactions
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

    // Content management
    publishedDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Related content
    relatedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'healthContent' }],

    readTime: { type: Number }, // in minutes
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    }
}, {
    timestamps: true
});

healthContentSchema.index({ category: 1, publishedDate: -1 });
healthContentSchema.index({ tags: 1 });
const healthContentModel = mongoose.models.healthContent || mongoose.model("healthContent", healthContentSchema);
export default healthContentModel;
