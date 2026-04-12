import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react'
import DOMPurify from 'dompurify'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const HealthBlog = () => {
    const { backendUrl, token } = useContext(AppContext)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedArticle, setSelectedArticle] = useState(null)
    const [readingMode, setReadingMode] = useState(false)
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [limit] = useState(9)
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
    const [filters, setFilters] = useState({ category: '', contentType: '' })

    const categories = useMemo(() => ([
        { value: '', label: 'All Categories' },
        { value: 'nutrition', label: 'Nutrition' },
        { value: 'fitness', label: 'Fitness' },
        { value: 'mental_health', label: 'Mental Health' },
        { value: 'disease_prevention', label: 'Disease Prevention' },
        { value: 'lifestyle', label: 'Lifestyle' },
        { value: 'pregnancy', label: 'Pregnancy' },
        { value: 'child_care', label: 'Child Care' },
        { value: 'senior_care', label: 'Senior Care' },
        { value: 'general', label: 'General' }
    ]), [])

    const contentTypes = useMemo(() => ([
        { value: '', label: 'All Types' },
        { value: 'article', label: 'Article' },
        { value: 'tip', label: 'Tip' },
        { value: 'video', label: 'Video' },
        { value: 'infographic', label: 'Infographic' },
        { value: 'podcast', label: 'Podcast' }
    ]), [])

    // Fetch articles from backend content API (with pagination + filters)
    const fetchArticles = useCallback(async (query, pageOverride) => {
        setLoading(true)
        setError(null)

        try {
            const targetPage = pageOverride || page
            const { data } = await axios.get(`${backendUrl}/api/content`, {
                params: {
                    search: query?.trim() || undefined,
                    category: filters.category || undefined,
                    contentType: filters.contentType || undefined,
                    page: targetPage,
                    limit
                }
            })

            if (data.success) {
                const mapped = (data.content || []).map(item => ({
                    id: item._id,
                    slug: item.slug,
                    title: item.title,
                    category: item.category,
                    excerpt: item.summary,
                    author: item.author?.name || 'Health Expert',
                    date: item.publishedDate ? new Date(item.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }) : '',
                    image: item.featuredImage || assets.about_image,
                    readTime: item.readTime ? `${item.readTime} min read` : '4 min read',
                    likes: item.likes,
                    views: item.views,
                    tags: item.tags || [],
                    content: null
                }))
                setArticles(mapped)
                if (data.pagination) {
                    setPagination({
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages
                    })
                    setPage(data.pagination.page)
                }
            } else {
                setError(data.message || 'Unable to fetch content')
            }
        } catch (err) {
            console.error('Error fetching articles:', err)
            // Graceful fallback to mock content so UI never goes empty
            const mockArticles = [
                {
                    id: 'mock1',
                    slug: 'eye-health-screen-time',
                    title: 'The Unbearable Rise of Screen Time and Its Hidden Toll on Eye Health',
                    category: 'wellness',
                    excerpt: 'Excessive blue light exposure is accelerating digital eye strain. The 20-20-20 rule still works.',
                    author: 'Dr. Sarah Jenkins',
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    image: 'https://images.unsplash.com/photo-1551847683-1628d02e88a3?w=800',
                    readTime: '4 min read',
                    content: '<p>Look 20 feet away for 20 seconds every 20 minutes. Pair with ambient lighting and blink reminders.</p>',
                    tags: ['eyes', 'screen time']
                },
                {
                    id: 'mock2',
                    slug: 'gut-brain-connection',
                    title: 'Understanding the Gut-Brain Connection',
                    category: 'nutrition',
                    excerpt: 'Your microbiome influences serotonin production and mood stability.',
                    author: 'James Harrison, RD',
                    date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
                    readTime: '6 min read',
                    content: '<p>Fermented foods and fiber diversify the microbiome; aim for 25-30g fiber daily.</p>',
                    tags: ['gut health', 'mood']
                },
                {
                    id: 'mock3',
                    slug: 'cardio-vs-weights',
                    title: 'Cardio vs. Weightlifting: Which is Better for Cardiac Health?',
                    category: 'fitness',
                    excerpt: 'A mix of endurance and strength training protects the heart best.',
                    author: 'Dr. Emily Chen',
                    date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
                    readTime: '5 min read',
                    content: '<p>Alternate 30 minutes of moderate cardio with two strength sessions weekly.</p>',
                    tags: ['cardio', 'strength']
                }
            ]
            setArticles(mockArticles)
            setPagination({ total: mockArticles.length, totalPages: 1 })
            setPage(1)
            setError(null)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, filters.category, filters.contentType, limit])

    // Fetch full article by slug for reading view
    const fetchArticleDetail = useCallback(async (slug) => {
        if (!slug) return
        setDetailLoading(true)
        setError(null)
        try {
            const { data } = await axios.get(`${backendUrl}/api/content/slug/${slug}`)
            if (data.success && data.content) {
                setSelectedArticle({
                    id: data.content._id,
                    slug: data.content.slug,
                    title: data.content.title,
                    category: data.content.category,
                    author: data.content.author?.name || 'Health Expert',
                    date: data.content.publishedDate ? new Date(data.content.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }) : '',
                    image: data.content.featuredImage || assets.about_image,
                    readTime: data.content.readTime ? `${data.content.readTime} min read` : '4 min read',
                    content: data.content.content || '<p>No content available.</p>',
                    tags: data.content.tags || [],
                    likes: data.content.likes,
                    views: data.content.views,
                    related: data.content.relatedArticles || []
                })
                setReadingMode(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } else {
                setError(data.message || 'Article not found')
            }
        } catch (err) {
            console.error('Error fetching article detail:', err)
            setError('Unable to load article right now.')
        } finally {
            setDetailLoading(false)
        }
    }, [backendUrl])

    // Initial load & filter changes
    useEffect(() => {
        fetchArticles(searchQuery, 1)
    }, [fetchArticles, filters.category, filters.contentType])

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchArticles(searchQuery, 1)
        }, 400)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, fetchArticles])

    const filteredPosts = articles

    const handleCardClick = (post) => {
        if (post.slug) {
            fetchArticleDetail(post.slug)
        } else {
            setSelectedArticle(post)
            setReadingMode(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBackToList = () => {
        setReadingMode(false)
        setSelectedArticle(null)
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPage(1)
    }

    const handlePageChange = (direction) => {
        const nextPage = direction === 'next' ? page + 1 : page - 1
        const clamped = Math.min(Math.max(nextPage, 1), pagination.totalPages)
        setPage(clamped)
        fetchArticles(searchQuery, clamped)
    }

    // Article Reading View
    if (readingMode && selectedArticle) {
        return (
            <div className='min-h-screen py-8 mb-20 px-4 md:px-6 animate-fade-in'>
                <div className='max-w-4xl mx-auto px-4'>
                    {/* Back Button */}
                    <button
                        onClick={handleBackToList}
                        className='flex items-center gap-2 text-cyan-700 hover:text-cyan-800 transition-colors mb-8 group font-semibold'
                    >
                        <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                        </svg>
                        <span className='font-semibold'>Back to Articles</span>
                    </button>

                    {/* Article Header */}
                    <div className='rounded-3xl overflow-hidden mb-8 animate-scale-in border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none'>
                        <div className='relative h-80 md:h-96'>
                            <img
                                src={selectedArticle.image}
                                alt={selectedArticle.title}
                                className='w-full h-full object-cover'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent'></div>
                            <div className='absolute bottom-0 left-0 right-0 p-8 text-white'>
                                <span className='inline-block px-4 py-1.5 bg-white dark:bg-gray-800/20 backdrop-blur-md rounded-full text-sm font-semibold mb-4 capitalize'>
                                    {selectedArticle.category}
                                </span>
                                <h1 className='text-3xl md:text-5xl font-black mb-4 leading-tight'>
                                    {selectedArticle.title}
                                </h1>
                                <div className='flex flex-wrap items-center gap-4 md:gap-6 text-sm'>
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                        <span>{selectedArticle.author}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                        </svg>
                                        <span>{selectedArticle.date}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                        </svg>
                                        <span>{selectedArticle.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className='rounded-3xl p-8 md:p-12 mb-8 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none'>
                        <div
                            className='article-content text-slate-700 dark:text-slate-200 leading-relaxed'
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedArticle.content || '') }}
                        />
                    </div>

                    {/* Related Articles */}
                    <div className='mb-8'>
                        <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-6'>Related Articles</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {articles
                                .filter(post => post.category === selectedArticle.category && post.id !== selectedArticle.id)
                                .slice(0, 2)
                                .map(post => (
                                    <div
                                        key={post.id}
                                        onClick={() => handleCardClick(post)}
                                        className='rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300 cursor-pointer group'
                                    >
                                        <div className='relative overflow-hidden h-48'>
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                            />
                                        </div>
                                        <div className='p-5'>
                                            <span className='text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-1 rounded-full capitalize'>
                                                {post.category}
                                            </span>
                                            <h4 className='text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2 group-hover:text-cyan-700 transition-colors'>
                                                {post.title}
                                            </h4>
                                            <p className='text-sm text-slate-600 dark:text-slate-300 line-clamp-2'>
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Back to Top */}
                    <div className='text-center'>
                        <button
                            onClick={handleBackToList}
                            className='px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-cyan-600 to-sky-700 hover:opacity-95 transition-all duration-300'
                        >
                            View All Articles
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Blog List View
    return (
        <div className='min-h-screen py-8 mb-20 px-4 md:px-6 animate-fade-in'>
            <div className='max-w-7xl mx-auto'>
                {/* Header Section */}
                <div className='relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 md:p-8 mb-8'>
                    <div className='absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl'></div>
                    <div className='absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl'></div>
                    <div className='relative text-center'>
                        <span className='inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4'>
                            Knowledge Hub
                        </span>
                        <h1 className='text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3'>Health Blog</h1>
                        <p className='text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
                            Explore expert insights, practical wellness tips, and clear guidance to make better daily health decisions.
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Articles on This Page</p>
                        <p className='text-3xl font-black text-slate-900 dark:text-white'>{filteredPosts.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Total Content</p>
                        <p className='text-3xl font-black text-cyan-700'>{pagination.total || filteredPosts.length}</p>
                    </div>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:shadow-none'>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-1'>Current Page</p>
                        <p className='text-3xl font-black text-emerald-600'>{page}/{pagination.totalPages || 1}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className='flex justify-center mb-8'>
                    <div className='w-full max-w-3xl'>
                        <div className='relative'>
                            <input
                                type='text'
                                placeholder='Search for any health topic (e.g., protein, diabetes, yoga)...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all pl-12'
                            />
                            <svg className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className='max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm dark:shadow-none'>
                    <div className='flex gap-4 flex-1'>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className='px-4 py-3 rounded-xl text-sm w-full md:w-1/2 border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400'
                        >
                            {categories.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.contentType}
                            onChange={(e) => handleFilterChange('contentType', e.target.value)}
                            className='px-4 py-3 rounded-xl text-sm w-full md:w-1/2 border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400'
                        >
                            {contentTypes.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className='text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-4 py-2 rounded-xl'>
                        Showing page {page} of {pagination.totalPages || 1}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className='text-center py-20'>
                        <div className='inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600'></div>
                        <p className='text-slate-600 dark:text-slate-300 mt-4'>Loading articles...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className='rounded-3xl p-8 mb-8 border border-red-200 bg-red-50'>
                        <div className='text-center text-red-600'>
                            <svg className='w-12 h-12 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            <p className='font-semibold mb-2'>{error}</p>
                            <p className='text-sm text-red-800/80'>Please try again or adjust filters.</p>
                        </div>
                    </div>
                )}

                {/* Blog Posts Grid */}
                {!loading && !error && (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16'>
                        {filteredPosts.map((post, index) => (
                            <div
                                key={post.id}
                                onClick={() => handleCardClick(post)}
                                className='rounded-3xl overflow-hidden border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-500 cursor-pointer group animate-scale-in'
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className='relative overflow-hidden'>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className='w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500'
                                        onError={(e) => {
                                            e.target.onerror = null
                                            e.target.src = assets.contact_image
                                        }}
                                    />
                                    <div className='absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                    <div className='absolute top-4 right-4'>
                                        <span className='bg-slate-900/75 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md'>
                                            {post.readTime}
                                        </span>
                                    </div>
                                </div>
                                <div className='p-6'>
                                    <div className='mb-3'>
                                        <span className='text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-full capitalize'>
                                            {post.category}
                                        </span>
                                    </div>
                                    <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-700 transition-colors duration-300 line-clamp-2'>
                                        {post.title}
                                    </h3>
                                    <p className='text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-2'>
                                        {post.excerpt}
                                    </p>
                                    <div className='flex items-center justify-between pt-4 border-t border-slate-200 dark:border-gray-700'>
                                        <div>
                                            <p className='text-sm font-medium text-slate-700 dark:text-slate-200'>{post.author}</p>
                                            <p className='text-xs text-slate-500 dark:text-slate-400'>{post.date}</p>
                                        </div>
                                        <button className='text-cyan-700 text-sm font-semibold hover:underline group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1'>
                                            Read More
                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredPosts.length > 0 && (
                    <div className='flex items-center justify-center gap-4 mb-12'>
                        <button
                            onClick={() => handlePageChange('prev')}
                            disabled={page <= 1}
                            className='px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Previous
                        </button>
                        <span className='text-sm text-slate-600 dark:text-slate-300'>Page {page} of {pagination.totalPages || 1}</span>
                        <button
                            onClick={() => handlePageChange('next')}
                            disabled={page >= (pagination.totalPages || 1)}
                            className='px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* No Results Message */}
                {!loading && !error && filteredPosts.length === 0 && (
                    <div className='text-center py-20 animate-fade-in'>
                        <div className='inline-block px-8 py-12 rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none'>
                            <svg className='w-20 h-20 text-slate-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                            </svg>
                            <p className='text-slate-500 dark:text-slate-400 text-lg font-medium'>No articles found</p>
                            <p className='text-slate-400 text-sm mt-2'>Try different keywords or categories</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HealthBlog
