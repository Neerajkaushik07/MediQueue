import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaPaperPlane, FaUserCircle, FaCheckCircle, FaThumbsUp, FaThumbsDown, FaShieldAlt } from 'react-icons/fa'

const Community = () => {
    const { userData, token, isDemoMode, userRole } = useContext(AppContext)
    
    // Initial static dummy data with trust metrics
    const initialPosts = [
        {
            id: 1,
            author: {
                name: 'Emma Thompson',
                image: null,
                isDoctor: false
            },
            content: 'Just tried the ginger and honey tea for my morning sore throat. Highly recommend! It works wonders within minutes. 🍵✨',
            tags: ['#HomeRemedies', '#Wellness'],
            likes: 24,
            isLiked: false,
            comments: [
                { 
                    id: 101, 
                    authorName: 'Sarah Jenkins', 
                    isDoctor: false,
                    text: 'I add a squeeze of lemon to mine, makes it even better!',
                    upvotes: 15,
                    downvotes: 1
                }
            ],
            time: '2 hours ago'
        },
        {
            id: 2,
            author: {
                name: 'David Chen',
                image: null,
                isDoctor: false
            },
            content: 'Had a great experience with Dr. Richard James at the Apollo Clinic. He took his time to explain everything clearly. Finally found a GP I can trust.',
            tags: ['#DoctorReview', '#GeneralPhysician'],
            likes: 15,
            isLiked: false,
            comments: [],
            time: '5 hours ago'
        },
        {
            id: 3,
            author: {
                name: 'Priya Sharma',
                image: null,
                isDoctor: false
            },
            content: 'Does anyone have tips for managing back pain while working from home? Sitting at the desk for 8 hours is taking a toll.',
            tags: ['#HealthTips', '#WorkFromHome'],
            likes: 42,
            isLiked: false,
            comments: [
                { 
                    id: 102, 
                    authorName: 'Dr. Sarah Williams', 
                    isDoctor: true,
                    text: 'Try ergonomic chairs and take a 5-minute walk every hour to stretch your back muscles. Core strengthening exercises will also provide long-term relief.',
                    upvotes: 89,
                    downvotes: 2
                },
                { 
                    id: 103, 
                    authorName: 'Alex Johnson', 
                    isDoctor: false,
                    text: 'Standing desk changed my life!',
                    upvotes: 45,
                    downvotes: 8
                }
            ],
            time: '1 day ago'
        }
    ]

    const [posts, setPosts] = useState(() => {
        const savedPosts = localStorage.getItem('mediQueue_community_posts')
        if (savedPosts) {
            try {
                return JSON.parse(savedPosts)
            } catch (e) {
                return initialPosts
            }
        }
        return initialPosts
    })

    useEffect(() => {
        localStorage.setItem('mediQueue_community_posts', JSON.stringify(posts))
    }, [posts])

    const [newPostContent, setNewPostContent] = useState('')
    const [activeCommentPostId, setActiveCommentPostId] = useState(null)
    const [newCommentText, setNewCommentText] = useState('')

    const handleCreatePost = (e) => {
        e.preventDefault()

        if (!token && !isDemoMode && !userData) {
            toast.error('Please login to participate in the community')
            return
        }

        if (!newPostContent.trim()) {
            toast.warning('Post content cannot be empty')
            return
        }

        const newPost = {
            id: Date.now(),
            author: {
                name: userData?.name || 'Anonymous User',
                image: userData?.image || null,
                isDoctor: userRole === 'doctor'
            },
            content: newPostContent,
            tags: [], 
            likes: 0,
            isLiked: false,
            comments: [],
            time: 'Just now'
        }

        setPosts([newPost, ...posts])
        setNewPostContent('')
        toast.success('Post created successfully!')
    }

    const toggleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                const newIsLiked = !post.isLiked
                return {
                    ...post,
                    isLiked: newIsLiked,
                    likes: newIsLiked ? post.likes + 1 : post.likes - 1
                }
            }
            return post
        }))
    }

    const handleAddComment = (postId) => {
        if (!token && !isDemoMode && !userData) {
            toast.error('Please login to comment')
            return
        }

        if (!newCommentText.trim()) {
            return
        }

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, {
                        id: Date.now(),
                        authorName: userData?.name || 'Anonymous',
                        isDoctor: userRole === 'doctor',
                        text: newCommentText,
                        upvotes: 0,
                        downvotes: 0
                    }]
                }
            }
            return post
        }))

        setNewCommentText('')
        toast.success('Comment added')
    }

    const handleVoteComment = (postId, commentId, isUpvote) => {
        if (!token && !isDemoMode && !userData) {
            toast.error('Please login to vote on answers')
            return
        }

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: post.comments.map(comment => {
                        if (comment.id === commentId) {
                            const newVoteType = isUpvote ? 'up' : 'down'
                            let newUpvotes = comment.upvotes || 0
                            let newDownvotes = comment.downvotes || 0
                            let newUserVote = comment.userVote

                            if (comment.userVote === newVoteType) {
                                // Undo vote
                                if (isUpvote) newUpvotes--;
                                else newDownvotes--;
                                newUserVote = null;
                            } else {
                                // Switch or set new vote
                                if (isUpvote) {
                                    newUpvotes++;
                                    if (comment.userVote === 'down') newDownvotes--;
                                } else {
                                    newDownvotes++;
                                    if (comment.userVote === 'up') newUpvotes--;
                                }
                                newUserVote = newVoteType;
                            }

                            return {
                                ...comment,
                                upvotes: newUpvotes,
                                downvotes: newDownvotes,
                                userVote: newUserVote
                            }
                        }
                        return comment
                    })
                }
            }
            return post
        }))
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
        } catch (err) {
            toast.error('Failed to copy link')
        }
    }

    const getTrustMetrics = (upvotes, downvotes) => {
        const totalVotes = (upvotes || 0) + (downvotes || 0);
        if (totalVotes === 0) return { score: 0, text: 'No ratings yet', color: 'text-gray-400', level: 'none' };
        
        const accuracy = Math.round((upvotes / totalVotes) * 100);
        
        if (accuracy >= 90 && totalVotes >= 5) return { score: accuracy, text: 'Highly Trusted', color: 'text-green-600', level: 'high' };
        if (accuracy >= 70) return { score: accuracy, text: 'Generally Reliable', color: 'text-blue-500', level: 'medium' };
        if (accuracy >= 50) return { score: accuracy, text: 'Mixed Feedback', color: 'text-yellow-600', level: 'low' };
        return { score: accuracy, text: 'Low Trust', color: 'text-red-500', level: 'poor' };
    }

    return (
        <div className='max-w-4xl mx-auto px-4 py-8 mb-20'>
            {/* Header */}
            <div className='text-center mb-10'>
                <div className='inline-block px-4 py-2 bg-gradient-primary rounded-full text-sm font-semibold mb-4 text-white hover:scale-105 transition-transform duration-300'>
                    👥 PATIENT FORUM
                </div>
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                    Health <span className='text-transparent bg-clip-text bg-gradient-primary'>Community</span>
                </h1>
                <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
                    Connect with others, share home remedies, discuss experiences with doctors, and build a supportive health network. Find highly trusted answers rated by patients & verified by doctors.
                </p>
            </div>

            {/* Create Post Section */}
            <div className='bg-white rounded-2xl shadow-luxury p-6 mb-8 border border-gray-100 animate-fade-in-up'>
                <div className='flex gap-4'>
                    <div className='w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0 flex items-center justify-center shadow-inner relative'>
                        {userData?.image && typeof userData.image === 'string' && userData.image !== '' ? (
                            <img src={userData.image} alt="Profile" className='w-full h-full object-cover' />
                        ) : (
                            <FaUserCircle className='text-3xl text-primary/60' />
                        )}
                        {userRole === 'doctor' && (
                            <div className='absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm'>
                                <FaCheckCircle className='text-blue-500 text-xs' />
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleCreatePost} className='flex-1'>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={userRole === 'doctor' ? "Share your medical expertise or insights..." : "Share a health tip, doctor review, or ask a question..."}
                            className='w-full rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/50 text-gray-700 p-4 resize-none'
                            rows="3"
                        />
                        <div className='flex justify-between items-center mt-4'>
                            <div className='flex gap-2 text-primary/60 text-xl'>
                            </div>
                            <button
                                type="submit"
                                className='bg-gradient-primary text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-300'
                            >
                                <FaPaperPlane className='text-sm' />
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Posts Feed */}
            <div className='space-y-6'>
                {posts.map((post, index) => (
                    <div 
                        key={post.id} 
                        className='bg-white rounded-2xl shadow-luxury p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in-up'
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Post Header */}
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-12 h-12 rounded-full overflow-hidden bg-gradient-calm flex flex-shrink-0 items-center justify-center relative'>
                                {post.author.image ? (
                                    <img src={post.author.image} alt={post.author.name} className='w-full h-full object-cover' />
                                ) : (
                                    <span className='font-bold text-primary text-xl'>
                                        {post.author.name.charAt(0)}
                                    </span>
                                )}
                                {post.author.isDoctor && (
                                    <div className='absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm'>
                                        <FaCheckCircle className='text-blue-500 text-sm' />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className='flex items-center gap-2'>
                                    <h4 className='font-bold text-gray-900'>{post.author.name}</h4>
                                    {post.author.isDoctor && (
                                        <span className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100'>
                                            <FaCheckCircle /> Verified Doctor
                                        </span>
                                    )}
                                </div>
                                <p className='text-xs text-gray-500 font-medium'>{post.time}</p>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className='mb-4 text-gray-800 leading-relaxed font-medium'>
                            {post.content}
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {post.tags.map(tag => (
                                    <span key={tag} className='text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full'>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className='flex items-center gap-6 text-gray-500 pt-4 border-t border-gray-100'>
                            <button 
                                onClick={() => toggleLike(post.id)}
                                className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-primary'}`}
                            >
                                {post.isLiked ? <FaHeart /> : <FaRegHeart />}
                                <span className='font-medium'>{post.likes}</span>
                            </button>
                            
                            <button 
                                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                className='flex items-center gap-2 hover:text-primary transition-colors'
                            >
                                <FaComment />
                                <span className='font-medium'>{post.comments.length} Answers</span>
                            </button>

                            <button onClick={handleShare} className='flex items-center gap-2 hover:text-primary transition-colors ml-auto'>
                                <FaShare />
                                <span className='hidden sm:inline font-medium'>Share</span>
                            </button>
                        </div>

                        {/* Comments / Answers Section */}
                        {activeCommentPostId === post.id && (
                            <div className='mt-6 pt-6 border-t border-gray-100'>
                                <h5 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                    Discussion & Answers
                                </h5>
                                
                                <div className='space-y-5 mb-6'>
                                    {post.comments.map(comment => {
                                        const trust = getTrustMetrics(comment.upvotes, comment.downvotes);
                                        return (
                                            <div key={comment.id} className={`p-4 rounded-xl border ${comment.isDoctor ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className='flex justify-between items-start mb-2'>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <span className='font-bold text-sm text-gray-900'>
                                                            {comment.authorName}
                                                        </span>
                                                        {comment.isDoctor && (
                                                            <span className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 px-2 py-0.5 rounded-full'>
                                                                <FaCheckCircle /> Verified Medical Professional
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className='text-gray-700 text-sm mb-3 leading-relaxed'>
                                                    {comment.text}
                                                </div>
                                                
                                                {/* Trust Metrics System */}
                                                <div className='flex items-center flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200/60'>
                                                    <div className='flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm'>
                                                        <button 
                                                            onClick={() => handleVoteComment(post.id, comment.id, true)}
                                                            className={`p-1 transition-colors ${comment.userVote === 'up' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                                            title="Helpful & Accurate"
                                                        >
                                                            <FaThumbsUp className='text-sm' />
                                                        </button>
                                                        <span className={`text-xs font-bold min-w-[20px] text-center ${((comment.upvotes || 0) - (comment.downvotes || 0)) < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                                            {(comment.upvotes || 0) - (comment.downvotes || 0)}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleVoteComment(post.id, comment.id, false)}
                                                            className={`p-1 transition-colors ${comment.userVote === 'down' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                                            title="Not Helpful or Inaccurate"
                                                        >
                                                            <FaThumbsDown className='text-sm' />
                                                        </button>
                                                    </div>

                                                    {(comment.upvotes > 0 || comment.downvotes > 0) ? (
                                                        <div className={`flex items-center gap-1.5 text-xs font-bold ${trust.color} bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm`}>
                                                            {trust.level === 'high' ? <FaShieldAlt /> : <FaCheckCircle />}
                                                            <span>{trust.text} ({trust.score}% Accuracy)</span>
                                                        </div>
                                                    ) : (
                                                        <span className='text-xs text-gray-400 font-medium italic bg-white px-3 py-1.5 rounded-lg border border-gray-100'>No ratings yet</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {post.comments.length === 0 && (
                                        <div className='text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200'>
                                            <div className='text-3xl mb-2'>💡</div>
                                            <p className='text-gray-500 font-medium'>No answers yet. Share your knowledge!</p>
                                        </div>
                                    )}
                                </div>
                                <div className='flex gap-2 relative bg-white p-2 rounded-2xl shadow-sm border border-gray-200 focus-within:ring-2 ring-primary/20 transition-all'>
                                    <div className='w-8 h-8 rounded-full overflow-hidden bg-gradient-calm flex-shrink-0 flex items-center justify-center'>
                                        {userData?.image ? (
                                            <img src={userData.image} alt="User" className='w-full h-full object-cover' />
                                        ) : (
                                            <FaUserCircle className='text-gray-400 text-xl' />
                                        )}
                                    </div>
                                    <input 
                                        type='text'
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder={userRole === 'doctor' ? 'Provide a verified medical answer...' : 'Share your answer or experience...'}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                        className='flex-1 bg-transparent border-none px-2 py-1 text-sm focus:outline-none text-gray-700'
                                    />
                                    <button 
                                        onClick={() => handleAddComment(post.id)}
                                        disabled={!newCommentText.trim()}
                                        className='bg-primary text-white p-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[40px]'
                                    >
                                        <FaPaperPlane className='text-sm' />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Community
