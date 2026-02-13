import React, { useState, useEffect, useCallback } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'

const HealthBlog = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedArticle, setSelectedArticle] = useState(null)
    const [readingMode, setReadingMode] = useState(false)
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Reputable health and medical domains
    const healthyDomains = 'medicalnewstoday.com,healthline.com,mayoclinic.org,webmd.com,nih.gov,who.int,cdc.gov,health.harvard.edu,hopkinsmedicine.org,sciencedaily.com,medscape.com,clevelandclinic.org,nhs.uk'

    // Fetch articles based on search query
    const fetchArticles = useCallback(async (query) => {
        setLoading(true)
        setError(null)

        const NEWS_API_KEY = '80dea91e9d56489ea919388f86463b99'
        const NEWS_API_URL = 'https://newsapi.org/v2/everything'

        try {
            // If empty search, use default 'health'
            const searchTerm = query?.trim() || 'health'

            const response = await axios.get(NEWS_API_URL, {
                params: {
                    // Force health context by appending health keywords to query
                    q: `(${searchTerm}) AND (health OR medical OR wellness OR clinical)`,
                    language: 'en',
                    sortBy: 'relevancy', // Use relevancy for better search results
                    pageSize: 30,
                    domains: healthyDomains, // Restrict to trusted medical sources
                    apiKey: NEWS_API_KEY
                }
            })

            // Transform API response to match our component structure
            const transformedArticles = response.data.articles.map((article, index) => ({
                id: index + 1,
                title: article.title,
                category: 'Health',
                excerpt: article.description || 'Click to read more about this health topic.',
                author: article.author || 'Health Expert',
                date: new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                image: article.urlToImage || assets.about_image,
                readTime: '5 min read',
                content: article.content ? `
                    <div class="prose max-w-none">
                        <p class="text-lg mb-4">${article.description || ''}</p>
                        <div class="mb-6">${article.content.replace(/\[.*?\+.*?\]/g, '')}</div>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                           class="inline-flex items-center gap-2 text-primary hover:text-purple-700 font-semibold mt-4">
                            Read full article on ${article.source.name}
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                ` : `<p>Click the link above to read the full article.</p>`,
                url: article.url,
                source: article.source.name
            }))

            setArticles(transformedArticles)
        } catch (err) {
            console.error('Error fetching articles:', err)
            setError('Failed to fetch articles. Please check your API key or try again later.')
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load
    useEffect(() => {
        fetchArticles()
    }, [fetchArticles])

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim()) {
            const timeoutId = setTimeout(() => {
                fetchArticles(searchQuery)
            }, 500)
            return () => clearTimeout(timeoutId)
        } else {
            fetchArticles()
        }
    }, [searchQuery, fetchArticles])

    const filteredPosts = articles

    const handleCardClick = (post) => {
        setSelectedArticle(post)
        setReadingMode(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBackToList = () => {
        setReadingMode(false)
        setSelectedArticle(null)
    }

    // Article Reading View
    if (readingMode && selectedArticle) {
        return (
            <div className='min-h-screen py-10 animate-fade-in'>
                <div className='max-w-4xl mx-auto px-4'>
                    {/* Back Button */}
                    <button
                        onClick={handleBackToList}
                        className='flex items-center gap-2 text-primary hover:text-purple-700 transition-colors mb-8 group'
                    >
                        <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                        </svg>
                        <span className='font-semibold'>Back to Articles</span>
                    </button>

                    {/* Article Header */}
                    <div className='glass-card rounded-3xl overflow-hidden mb-8 animate-scale-in'>
                        <div className='relative h-96'>
                            <img
                                src={selectedArticle.image}
                                alt={selectedArticle.title}
                                className='w-full h-full object-cover'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent'></div>
                            <div className='absolute bottom-0 left-0 right-0 p-8 text-white'>
                                <span className='inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-4'>
                                    {selectedArticle.category}
                                </span>
                                <h1 className='text-4xl md:text-5xl font-bold mb-4 leading-tight'>
                                    {selectedArticle.title}
                                </h1>
                                <div className='flex items-center gap-6 text-sm'>
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
                    <div className='glass-card rounded-3xl p-8 md:p-12 mb-8'>
                        <div
                            className='article-content text-gray-700 leading-relaxed'
                            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                        />
                    </div>

                    {/* Related Articles */}
                    <div className='mb-8'>
                        <h3 className='text-2xl font-bold mb-6'>Related Articles</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {articles
                                .filter(post => post.category === selectedArticle.category && post.id !== selectedArticle.id)
                                .slice(0, 2)
                                .map(post => (
                                    <div
                                        key={post.id}
                                        onClick={() => handleCardClick(post)}
                                        className='glass-card rounded-2xl overflow-hidden hover:shadow-luxury transition-all duration-300 cursor-pointer group'
                                    >
                                        <div className='relative overflow-hidden h-48'>
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                            />
                                        </div>
                                        <div className='p-5'>
                                            <span className='text-xs font-semibold text-primary bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 rounded-full'>
                                                {post.category}
                                            </span>
                                            <h4 className='text-lg font-bold text-gray-900 mt-3 mb-2 group-hover:text-primary transition-colors'>
                                                {post.title}
                                            </h4>
                                            <p className='text-sm text-gray-600 line-clamp-2'>
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
                            className='glass-card px-8 py-3 rounded-full font-semibold text-primary hover:shadow-glow transition-all duration-300'
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
        <div className='min-h-screen py-10 animate-fade-in'>
            {/* Header Section */}
            <div className='text-center mb-12'>
                <span className='inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-primary text-sm font-semibold mb-4'>
                    📖 Knowledge Hub
                </span>
                <h1 className='text-4xl md:text-5xl font-bold luxury-heading mb-4'>Health Blog</h1>
                <p className='text-gray-600 max-w-2xl mx-auto leading-relaxed'>
                    Explore expert insights, wellness tips, and the latest medical knowledge to help you live a healthier life.
                </p>
            </div>

            {/* Search Bar */}
            <div className='flex justify-center mb-10'>
                <div className='w-full max-w-2xl px-4'>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Search for any health topic (e.g., protein, diabetes, yoga)...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='glass-card w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pl-12'
                        />
                        <svg className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className='text-center py-20'>
                    <div className='inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary'></div>
                    <p className='text-gray-600 mt-4'>Loading articles...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className='glass-card rounded-3xl p-8 mx-4 mb-8 border-2 border-red-200'>
                    <div className='text-center text-red-600'>
                        <svg className='w-12 h-12 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <p className='font-semibold mb-2'>{error}</p>
                        <p className='text-sm text-gray-600'>Make sure to replace 'YOUR_API_KEY_HERE' with your actual NewsAPI key.</p>
                    </div>
                </div>
            )}

            {/* Blog Posts Grid */}
            {!loading && !error && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-16'>
                    {filteredPosts.map((post, index) => (
                        <div
                            key={post.id}
                            onClick={() => handleCardClick(post)}
                            className='glass-card rounded-3xl overflow-hidden hover:shadow-luxury transition-all duration-500 cursor-pointer group card-3d premium-card animate-scale-in'
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
                                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                <div className='absolute top-4 right-4'>
                                    <span className='glass-dark text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md'>
                                        {post.readTime}
                                    </span>
                                </div>
                            </div>
                            <div className='p-6'>
                                <div className='mb-3'>
                                    <span className='text-xs font-semibold text-primary bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1.5 rounded-full capitalize'>
                                        {post.category}
                                    </span>
                                </div>
                                <h3 className='text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2'>
                                    {post.title}
                                </h3>
                                <p className='text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2'>
                                    {post.excerpt}
                                </p>
                                <div className='flex items-center justify-between pt-4 border-t border-gray-200/50'>
                                    <div>
                                        <p className='text-sm font-medium text-gray-700'>{post.author}</p>
                                        <p className='text-xs text-gray-500'>{post.date}</p>
                                    </div>
                                    <button className='text-primary text-sm font-semibold hover:underline group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1'>
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

            {/* No Results Message */}
            {!loading && !error && filteredPosts.length === 0 && (
                <div className='text-center py-20 animate-fade-in'>
                    <div className='glass-card inline-block px-8 py-12 rounded-3xl'>
                        <svg className='w-20 h-20 text-gray-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <p className='text-gray-500 text-lg font-medium'>No articles found</p>
                        <p className='text-gray-400 text-sm mt-2'>Try different keywords or categories</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HealthBlog
