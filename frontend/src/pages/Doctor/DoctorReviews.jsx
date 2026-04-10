import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const DoctorReviews = () => {
    const { backendUrl, token, isDemoMode } = useContext(AppContext)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRating, setSelectedRating] = useState('all')
    const [sortBy, setSortBy] = useState('recent')

    const getReviews = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }

            if (isDemoMode) {
                setReviews([
                    {
                        userName: 'Sarah Wilson',
                        userImage: assets.profile_pic,
                        rating: 5,
                        comment: 'Excellent consultation, very professional and thorough.',
                        date: '2026-02-15'
                    },
                    {
                        userName: 'John Miller',
                        userImage: assets.profile_pic,
                        rating: 4,
                        comment: 'Good experience, but the waiting time was slightly longer than expected.',
                        date: '2026-02-14'
                    }
                ])
                setLastUpdated(new Date())
                return
            }
            const { data } = await axios.post(backendUrl + '/api/doctor/reviews', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setReviews(Array.isArray(data.reviews) ? data.reviews : [])
                setLastUpdated(new Date())
            } else {
                toast.error(data.message)
            }
        } catch (error) {

            toast.error('Failed to load reviews')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [backendUrl, token, isDemoMode])

    useEffect(() => {
        if (token) {
            getReviews()
        }
    }, [token, getReviews])

    const filteredAndSortedReviews = useMemo(() => {
        let data = [...reviews]

        if (searchTerm.trim()) {
            const needle = searchTerm.toLowerCase()
            data = data.filter((review) =>
                review.userName?.toLowerCase().includes(needle) ||
                review.comment?.toLowerCase().includes(needle)
            )
        }

        if (selectedRating !== 'all') {
            data = data.filter((review) => Number(review.rating) === Number(selectedRating))
        }

        data.sort((a, b) => {
            if (sortBy === 'recent') return new Date(b.date || 0) - new Date(a.date || 0)
            if (sortBy === 'highest') return Number(b.rating || 0) - Number(a.rating || 0)
            if (sortBy === 'lowest') return Number(a.rating || 0) - Number(b.rating || 0)
            return 0
        })

        return data
    }, [reviews, searchTerm, selectedRating, sortBy])

    const ratingDistribution = useMemo(() => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviews.forEach((review) => {
            const rating = Number(review.rating)
            if (distribution[rating] !== undefined) {
                distribution[rating] += 1
            }
        })
        return distribution
    }, [reviews])

    const stats = useMemo(() => {
        const avg = reviews.length > 0
            ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
            : '0.0'
        const positivePercentage = reviews.length > 0
            ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
            : 0
        const lowRatings = reviews.filter((review) => Number(review.rating) <= 2).length
        return { avg, total: reviews.length, positivePercentage, lowRatings }
    }, [reviews])

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[70vh]'>
                <div className='relative'>
                    <div className='w-16 h-16 border-4 border-amber-100 rounded-full'></div>
                    <div className='w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-8 m-5 max-w-7xl animate-fade-in-up font-outfit'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                <div>
                    <h1 className='text-4xl font-black text-gray-900 tracking-tight'>Reputation & Trust</h1>
                    <p className='text-gray-500 mt-2 text-lg italic'>Monitor patient satisfaction and professional feedback pulse.</p>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest mt-3'>
                        Last synced: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not synced yet'}
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-soft border border-gray-100'>
                        <div className='w-3 h-3 bg-amber-400 rounded-full animate-pulse'></div>
                        <span className='text-xs font-black text-gray-500 uppercase tracking-widest'>Verified Professional Profile</span>
                    </div>
                    <button
                        onClick={() => getReviews(true)}
                        disabled={refreshing}
                        className='px-5 py-3 rounded-2xl border border-primary/30 bg-primary/5 text-primary font-black text-xs uppercase tracking-wider hover:bg-primary hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Reputation Dashboard Grid */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                {/* Avg Rating Card */}
                <div className='bg-white p-10 rounded-[3rem] shadow-card border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-2 transition-all duration-500'>
                    <div className='absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000'></div>

                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 relative z-10'>Experience Score</p>
                    <div className='relative z-10 flex items-end gap-2 mb-4'>
                        <h2 className='text-7xl font-black text-gray-900 leading-none'>{stats.avg}</h2>
                        <span className='text-2xl font-black text-gray-300 mb-1'>/ 5</span>
                    </div>

                    <div className='flex gap-1 text-amber-400 mb-6 relative z-10'>
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-5 h-5 ${i < Math.floor(Number(stats.avg)) ? 'fill-current' : 'text-gray-100 fill-current'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className='text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-full relative z-10'>Top 5% of Practitioners</p>
                </div>

                <div className='bg-white p-10 rounded-[3rem] shadow-card border border-gray-100 flex flex-col justify-center hover:-translate-y-2 transition-all duration-500'>
                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4'>Critical Feedback</p>
                    <h2 className='text-5xl font-black text-gray-900 leading-none'>{stats.lowRatings}</h2>
                    <p className='text-xs font-bold text-gray-500 mt-3'>Reviews with 1-2 stars that may need follow-up.</p>
                </div>

                {/* Satisfaction Breakdown */}
                <div className='md:col-span-2 bg-white p-10 rounded-[3rem] shadow-medical border border-gray-100'>
                    <div className='flex justify-between items-center mb-10'>
                        <h3 className='text-xl font-black text-gray-900 tracking-tight'>Satisfaction Distribution</h3>
                        <div className='flex items-center gap-6'>
                            <div className='text-right'>
                                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Sentiment Pulse</p>
                                <p className='text-lg font-black text-emerald-500'>{stats.positivePercentage}% Positive</p>
                            </div>
                            <div className='w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500'>
                                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-6'>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingDistribution[star]
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                                <div key={star} className='flex items-center gap-6 group'>
                                    <div className='flex items-center gap-2 min-w-[80px]'>
                                        <span className='text-xs font-black text-gray-500'>{star}</span>
                                        <svg className='w-3 h-3 text-amber-400 fill-current' viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </div>
                                    <div className='flex-1 h-3 bg-gray-50 rounded-full overflow-hidden relative'>
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 group-hover:brightness-110 ${star >= 4 ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : star >= 3 ? 'bg-yellow-300' : 'bg-red-300'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className='min-w-[40px] text-right'>
                                        <span className='text-xs font-black text-gray-400 group-hover:text-gray-900 transition-colors'>{count}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className='space-y-8'>
                <div className='flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5'>
                    <div>
                        <h3 className='text-2xl font-black text-gray-900 tracking-tight'>Patient Feedback</h3>
                        <p className='text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest'>All verified experiences from your clinic</p>
                    </div>

                    <div className='flex flex-wrap items-center gap-3 w-full lg:w-auto'>
                        <div className='relative min-w-[240px] flex-1 lg:flex-none'>
                            <svg className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                            </svg>
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder='Search feedback...'
                                className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                            />
                        </div>

                        <select
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className='px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black uppercase tracking-wider text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        >
                            <option value='all'>All Ratings</option>
                            <option value='5'>5 Stars</option>
                            <option value='4'>4 Stars</option>
                            <option value='3'>3 Stars</option>
                            <option value='2'>2 Stars</option>
                            <option value='1'>1 Star</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black uppercase tracking-wider text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        >
                            <option value='recent'>Recent First</option>
                            <option value='highest'>Highest Rated</option>
                            <option value='lowest'>Lowest Rated</option>
                        </select>

                        {(searchTerm || selectedRating !== 'all' || sortBy !== 'recent') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedRating('all')
                                    setSortBy('recent')
                                }}
                                className='px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-primary hover:text-primary transition-all shadow-sm'
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Showing {filteredAndSortedReviews.length} of {reviews.length} reviews</p>

                {filteredAndSortedReviews.length === 0 ? (
                    <div className='bg-white p-32 rounded-[4rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center grayscale opacity-50'>
                        <div className='w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8'>
                            <svg className='w-12 h-12 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' /></svg>
                        </div>
                        <h4 className='font-black text-2xl text-gray-800 tracking-tight'>{reviews.length ? 'No matching feedback' : 'Silence is Golden...'}</h4>
                        <p className='text-sm font-bold text-gray-400 mt-3 max-w-xs uppercase tracking-wider'>
                            {reviews.length ? 'Try changing filters or search terms to see more reviews.' : 'Your first verified patient review will shine here soon.'}
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {filteredAndSortedReviews.map((review) => (
                            <div key={review._id || review.appointmentId || `${review.userName}-${review.date}`} className='bg-white p-10 rounded-[3rem] shadow-card border border-gray-100 hover:shadow-medical hover:border-amber-100 transition-all duration-500 relative group'>
                                <div className='flex justify-between items-start mb-8'>
                                    <div className='flex items-center gap-5'>
                                        <div className='relative'>
                                            <div className='absolute inset-0 bg-gradient-primary rounded-[2rem] blur-lg opacity-0 group-hover:opacity-20 transition-opacity'></div>
                                            <img
                                                src={review.userImage || assets.profile_pic}
                                                className='w-16 h-16 rounded-[1.8rem] object-cover relative z-10 border-4 border-gray-50 group-hover:border-white transition-all duration-500 shadow-sm'
                                                alt=''
                                            />
                                            <div className='absolute -bottom-1 -right-1 bg-primary border-4 border-white w-6 h-6 rounded-full z-20 flex items-center justify-center'>
                                                <svg className='w-2.5 h-2.5 text-white' fill='currentColor' viewBox='0 0 20 20'><path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' /></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className='font-black text-gray-900 text-lg leading-tight'>{review.userName}</h4>
                                            <div className='flex items-center gap-2 mt-1'>
                                                <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors'>
                                                    Verified Experience
                                                </span>
                                                <span className='text-[10px] font-black text-gray-300 uppercase tracking-widest'>
                                                    {review.date ? new Date(review.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-0.5 text-amber-400 bg-amber-50/50 px-3 py-1.5 rounded-xl'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className={`w-3.5 h-3.5 ${star <= Number(review.rating || 0) ? 'fill-current' : 'fill-current text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                </div>
                                <div className='relative'>
                                    <svg className='absolute -left-4 -top-6 w-12 h-12 text-gray-50 group-hover:text-amber-50 group-hover:scale-110 transition-all duration-500' fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8h6l-2.286 9.143h-4.571L11.429 16H8V8h2zm12 0v8h6l-2.286 9.143h-4.571L23.429 16H20V8h2z" /></svg>
                                    <p className='text-gray-600 leading-[1.8] text-base relative z-10 pl-4 italic font-medium group-hover:text-gray-900 transition-colors'>
                                        {review.comment}
                                    </p>
                                </div>

                                <div className='mt-10 pt-8 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0'>
                                    <div className='flex gap-2'>
                                        <span className='px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400'>Consultation</span>
                                        <span className='px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400'>Verified</span>
                                    </div>
                                    <button className='text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:tracking-[0.3em] transition-all'>Public Reply</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Visual Polish Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .shadow-soft {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
            `}} />
        </div>
    )
}

export default DoctorReviews
