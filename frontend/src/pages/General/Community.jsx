import React, { useContext, useState, useEffect, useCallback } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FaHeart, FaRegHeart, FaComment, FaShareAlt, FaPaperPlane, FaUserCircle, FaCheckCircle, FaThumbsUp, FaThumbsDown, FaSearch, FaFilter, FaImage, FaTimes } from 'react-icons/fa'

const Community = () => {
    const { userData, token, isDemoMode, userRole, backendUrl } = useContext(AppContext)

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterCategory, setFilterCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const [newPostContent, setNewPostContent] = useState('')
    const [newPostCategory, setNewPostCategory] = useState('General')
    const [newPostImage, setNewPostImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const [activeCommentPostId, setActiveCommentPostId] = useState(null)
    const [newCommentText, setNewCommentText] = useState('')
    const [postComments, setPostComments] = useState({}) // Map postId -> comments array

    const categories = ['General', 'Health Tips', 'Questions', 'Wellness', 'Home Remedies', 'Recovery Stories']

    // Fetch Posts
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/community/list')
            if (data.success) {
                setPosts(data.posts || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load posts')
            setPosts([])
        } finally {
            setLoading(false)
        }
    }, [backendUrl])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    // Load comments for a post when expanded
    const loadComments = async (postId) => {
        if (postComments[postId]) return; // Already loaded

        try {
            const { data } = await axios.post(backendUrl + '/api/community/comments', { postId })
            if (data.success) {
                setPostComments(prev => ({ ...prev, [postId]: data.comments }))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewPostImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const clearImage = () => {
        setNewPostImage(null)
        setImagePreview(null)
    }

    const handleCreatePost = async (e) => {
        e.preventDefault()

        if (!token) {
            toast.error('Please login to post')
            return
        }

        if (!newPostContent.trim()) {
            toast.warning('Post content cannot be empty')
            return
        }

        try {
            const formData = new FormData()
            formData.append('content', newPostContent)
            formData.append('category', newPostCategory)
            if (newPostImage) {
                formData.append('image', newPostImage)
            }

            const endpoint = userRole === 'doctor' ? '/api/community/doctor/post' : '/api/community/user/post'

            const { data } = await axios.post(backendUrl + endpoint, formData, {
                headers: { token, 'Content-Type': 'multipart/form-data' }
            })

            if (data.success) {
                toast.success('Post created successfully!')
                setNewPostContent('')
                setNewPostCategory('General')
                clearImage()
                fetchPosts()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.message)
        }
    }

    const handleLike = async (postId) => {
        if (!token) return toast.error('Login to like posts')

        // Optimistic UI update
        const currentUserId = userData._id
        setPosts(posts.map(post => {
            if (post._id === postId) {
                const isLiked = post.likes.includes(currentUserId)
                return {
                    ...post,
                    likes: isLiked ? post.likes.filter(id => id !== currentUserId) : [...post.likes, currentUserId]
                }
            }
            return post
        }))

        try {
            const endpoint = userRole === 'doctor' ? '/api/community/doctor/like' : '/api/community/user/like'
            await axios.post(backendUrl + endpoint, { postId }, { headers: { token } })
        } catch (error) {
            console.error(error)
            fetchPosts() // Revert on error
        }
    }

    const handleAddComment = async (postId) => {
        if (!token) return toast.error('Login to comment')
        if (!newCommentText.trim()) return

        try {
            const endpoint = userRole === 'doctor' ? '/api/community/doctor/comment' : '/api/community/user/comment'
            const { data } = await axios.post(backendUrl + endpoint, { postId, content: newCommentText }, { headers: { token } })

            if (data.success) {
                toast.success('Comment added')
                setNewCommentText('')
                // Refresh comments
                const { data: commentsData } = await axios.post(backendUrl + '/api/community/comments', { postId })
                if (commentsData.success) {
                    setPostComments(prev => ({ ...prev, [postId]: commentsData.comments }))
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to add comment')
        }
    }

    const handleVoteComment = async (commentId, voteType) => {
        if (!token) return toast.error('Login to vote')

        // Optimistic UI update could be complex here, simplifying by just calling API then refreshing comments
        // Or implement optimistic if needed. For now, let's just call API.

        try {
            const endpoint = userRole === 'doctor' ? '/api/community/doctor/vote' : '/api/community/user/vote'
            const { data } = await axios.post(backendUrl + endpoint, { commentId, voteType }, { headers: { token } })

            if (data.success) {
                // Refresh active post's comments
                if (activeCommentPostId) {
                    const { data: commentsData } = await axios.post(backendUrl + '/api/community/comments', { postId: activeCommentPostId })
                    if (commentsData.success) {
                        setPostComments(prev => ({ ...prev, [activeCommentPostId]: commentsData.comments }))
                    }
                }
            }
        } catch (error) {
            console.error(error)
            toast.error('Vote failed')
        }
    }

    const filteredPosts = (posts || []).filter(post => {
        const matchesCategory = filterCategory === 'All' || post.category === filterCategory
        const contentMatch = post.content?.toLowerCase().includes(searchQuery.toLowerCase())
        const authorMatch = post.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && (contentMatch || authorMatch)
    })

    const formatDate = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className='max-w-4xl mx-auto px-4 py-8 mb-20'>
            {/* Header */}
            <div className='text-center mb-10'>
                <div className='inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4'>
                    👥 HEALTH FORUM
                </div>
                <h1 className='text-3xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100'>
                    Community <span className='text-indigo-600'>Support</span>
                </h1>
                <p className='text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto'>
                    Connect, share, and find trusted answers from patients & doctors.
                </p>
            </div>

            {/* Filters & Search */}
            <div className='flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-none border border-gray-100'>
                <div className="relative w-full md:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${filterCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Post Section */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none p-6 mb-8 border border-gray-100'>
                <div className='flex gap-4'>
                    <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0'>
                        {userData?.image ? (
                            <img src={userData.image} alt="Profile" className='w-full h-full object-cover' />
                        ) : (
                            <FaUserCircle className='w-full h-full text-gray-400 p-1' />
                        )}
                    </div>
                    <form onSubmit={handleCreatePost} className='flex-1'>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={userRole === 'doctor' ? "Share medical insights..." : "Ask a question or share your experience..."}
                            className='w-full rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-indigo-100 text-gray-700 dark:text-gray-200 p-4 resize-none min-h-[100px]'
                        />

                        {imagePreview && (
                            <div className="relative mt-2 w-full max-w-sm">
                                <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg" />
                                <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-gray-900/50 text-white p-1 rounded-full hover:bg-gray-900/70">
                                    <FaTimes />
                                </button>
                            </div>
                        )}

                        <div className='flex flex-wrap justify-between items-center mt-4 gap-3'>
                            <div className='flex gap-2 items-center'>
                                <select
                                    value={newPostCategory}
                                    onChange={(e) => setNewPostCategory(e.target.value)}
                                    className="text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                                    <FaImage className="text-xl" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <button
                                type="submit"
                                className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg'
                            >
                                <FaPaperPlane className='text-sm' />
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading community posts...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400">No posts found. Be the first to start a conversation!</p>
                    </div>
                ) : filteredPosts.map(post => {
                    const isLiked = userData && post.likes?.includes(userData._id);
                    const comments = postComments?.[post._id] || [];
                    const showComments = activeCommentPostId === post._id;

                    return (
                        <div key={post._id} className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'>
                            <div className='p-6'>
                                {/* Post Header */}
                                <div className='flex justify-between items-start mb-4'>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden'>
                                            {post.authorImage ? (
                                                <img src={post.authorImage} alt={post.authorName} className='w-full h-full object-cover' />
                                            ) : (
                                                <FaUserCircle className='w-full h-full text-gray-400 p-1' />
                                            )}
                                        </div>
                                        <div>
                                            <div className='flex items-center gap-2'>
                                                <span className='font-semibold text-gray-900 dark:text-white'>{post.authorName}</span>
                                                {post.userType === 'doctor' && (
                                                    <FaCheckCircle className='text-blue-500 text-sm' title="Verified Doctor" />
                                                )}
                                                {post.speciality && (
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{post.speciality}</span>
                                                )}
                                            </div>
                                            <div className='flex gap-2 text-xs text-gray-500 dark:text-gray-400'>
                                                <span>{formatDate(post.createdAt)}</span>
                                                <span>•</span>
                                                <span className='text-indigo-600 font-medium'>{post.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <p className='text-gray-700 dark:text-gray-200 leading-relaxed mb-4 whitespace-pre-wrap'>{post.content}</p>

                                {post.imageUrl && (
                                    <div className="mb-4 rounded-xl overflow-hidden max-h-96 bg-gray-50 dark:bg-gray-900 flex justify-center">
                                        <img src={post.imageUrl} alt="Post attachment" className="object-contain max-h-full" />
                                    </div>
                                )}

                                {/* Post Actions */}
                                <div className='flex items-center gap-6 pt-4 border-t border-gray-50'>
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                                    >
                                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                                        {post.likes?.length || 0} Likes
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (showComments) setActiveCommentPostId(null)
                                            else {
                                                setActiveCommentPostId(post._id);
                                                loadComments(post._id);
                                            }
                                        }}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${showComments ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600'}`}
                                    >
                                        <FaComment />
                                        {comments.length > 0 ? comments.length : 'Comment'}
                                    </button>
                                    <button className='flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-100 transition-colors ml-auto'>
                                        <FaShareAlt /> Share
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {showComments && (
                                <div className='bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-100 animate-fade-in'>
                                    {/* Add Comment */}
                                    <div className='flex gap-3 mb-6'>
                                        <div className='w-8 h-8 rounded-full bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-none flex-shrink-0'>
                                            {userData?.image ? (
                                                <img src={userData.image} alt="Me" className='w-full h-full object-cover' />
                                            ) : (
                                                <FaUserCircle className='w-full h-full text-gray-300 p-0.5' />
                                            )}
                                        </div>
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={newCommentText}
                                                onChange={(e) => setNewCommentText(e.target.value)}
                                                placeholder="Write a comment..."
                                                className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                            />
                                            <button
                                                onClick={() => handleAddComment(post._id)}
                                                className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-700 shadow-sm dark:shadow-none"
                                            >
                                                <FaPaperPlane className="text-xs" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {comments.length === 0 && <p className="text-center text-sm text-gray-400">No comments yet.</p>}
                                        {comments.map(comment => {
                                            const isUpvoted = userData && comment.upvotes?.includes(userData._id);
                                            const isDownvoted = userData && comment.downvotes?.includes(userData._id);
                                            const voteCount = (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);

                                            return (
                                                <div key={comment._id} className="flex gap-3">
                                                    <div className='w-8 h-8 rounded-full bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-none border border-gray-100 flex-shrink-0'>
                                                        {comment.authorImage ? (
                                                            <img src={comment.authorImage} alt={comment.authorName} className='w-full h-full object-cover' />
                                                        ) : (
                                                            <FaUserCircle className='w-full h-full text-gray-300 p-0.5' />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none inline-block min-w-[200px]">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.authorName}</span>
                                                                {comment.userType === 'doctor' && (
                                                                    <FaCheckCircle className="text-blue-500 text-xs" title="Verified Doctor" />
                                                                )}
                                                                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 ml-2">
                                                            <button
                                                                onClick={() => handleVoteComment(comment._id, 'up')}
                                                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${isUpvoted ? 'text-green-600' : 'text-gray-500 dark:text-gray-400 hover:text-green-600'}`}
                                                            >
                                                                <FaThumbsUp />
                                                                {comment.upvotes?.length || 0}
                                                            </button>
                                                            <button
                                                                onClick={() => handleVoteComment(comment._id, 'down')}
                                                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${isDownvoted ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
                                                            >
                                                                <FaThumbsDown />
                                                                {comment.downvotes?.length || 0}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Community

