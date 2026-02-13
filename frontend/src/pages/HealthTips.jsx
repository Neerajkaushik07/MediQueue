import React, { useState } from 'react'


const HealthTips = () => {
    const [activeTab, setActiveTab] = useState('Daily')
    const [likedTips, setLikedTips] = useState([])

    const dailyTips = [
        {
            id: 1,
            title: 'Stay Hydrated',
            description: 'Drink at least 8 glasses of water daily to keep your body hydrated and functioning properly.',
            icon: '💧',
            category: 'Hydration'
        },
        {
            id: 2,
            title: 'Get Moving',
            description: 'Aim for at least 30 minutes of physical activity every day. Even a brisk walk counts!',
            icon: '🏃',
            category: 'Exercise'
        },
        {
            id: 3,
            title: 'Eat Colorful Foods',
            description: 'Include a variety of fruits and vegetables in your diet to get all essential nutrients.',
            icon: '🥗',
            category: 'Nutrition'
        },
        {
            id: 4,
            title: 'Quality Sleep',
            description: 'Adults should aim for 7-9 hours of quality sleep each night for optimal health.',
            icon: '😴',
            category: 'Sleep'
        },
        {
            id: 5,
            title: 'Practice Mindfulness',
            description: 'Take 10 minutes daily for meditation or deep breathing to reduce stress and anxiety.',
            icon: '🧘',
            category: 'Mental Health'
        },
        {
            id: 6,
            title: 'Wash Your Hands',
            description: 'Regular hand washing with soap for 20 seconds helps prevent the spread of infections.',
            icon: '🧼',
            category: 'Hygiene'
        }
    ]

    const nutritionTips = [
        {
            id: 7,
            title: 'Protein Power',
            description: 'Include lean proteins like chicken, fish, eggs, and legumes in every meal for muscle health.',
            icon: '🍗',
            category: 'Nutrition'
        },
        {
            id: 8,
            title: 'Fiber First',
            description: 'Consume 25-30g of fiber daily from whole grains, fruits, and vegetables for digestive health.',
            icon: '🌾',
            category: 'Nutrition'
        },
        {
            id: 9,
            title: 'Healthy Fats',
            description: 'Include sources of omega-3 fatty acids like nuts, seeds, and fish for heart and brain health.',
            icon: '🥑',
            category: 'Nutrition'
        },
        {
            id: 10,
            title: 'Limit Processed Foods',
            description: 'Reduce intake of processed foods high in sugar, salt, and unhealthy fats.',
            icon: '🚫',
            category: 'Nutrition'
        },
        {
            id: 11,
            title: 'Portion Control',
            description: 'Use smaller plates and be mindful of serving sizes to avoid overeating.',
            icon: '🍽️',
            category: 'Nutrition'
        },
        {
            id: 12,
            title: 'Time Your Meals',
            description: 'Eat at regular intervals and avoid late-night snacking for better metabolism.',
            icon: '⏰',
            category: 'Nutrition'
        }
    ]

    const wellnessTips = [
        {
            id: 13,
            title: 'Regular Check-ups',
            description: 'Schedule annual health screenings and dental check-ups to catch issues early.',
            icon: '🏥',
            category: 'Preventive Care'
        },
        {
            id: 14,
            title: 'Limit Screen Time',
            description: 'Take breaks every 20 minutes when using screens to reduce eye strain and fatigue.',
            icon: '📱',
            category: 'Eye Health'
        },
        {
            id: 15,
            title: 'Social Connections',
            description: 'Maintain strong social relationships as they contribute to mental and emotional wellbeing.',
            icon: '👥',
            category: 'Mental Health'
        },
        {
            id: 16,
            title: 'Sun Protection',
            description: 'Apply SPF 30+ sunscreen daily, even on cloudy days, to protect against UV damage.',
            icon: '☀️',
            category: 'Skin Care'
        },
        {
            id: 17,
            title: 'Stress Management',
            description: 'Identify your stress triggers and develop healthy coping mechanisms like yoga or hobbies.',
            icon: '😌',
            category: 'Mental Health'
        },
        {
            id: 18,
            title: 'Limit Alcohol',
            description: 'If you drink, do so in moderation - up to 1 drink per day for women, 2 for men.',
            icon: '🍷',
            category: 'Lifestyle'
        }
    ]

    const getTipsForTab = () => {
        switch (activeTab) {
            case 'Daily':
                return dailyTips
            case 'Nutrition':
                return nutritionTips
            case 'Wellness':
                return wellnessTips
            default:
                return dailyTips
        }
    }

    const toggleLike = (tipId) => {
        if (likedTips.includes(tipId)) {
            setLikedTips(likedTips.filter(id => id !== tipId))
        } else {
            setLikedTips([...likedTips, tipId])
        }
    }

    const currentTips = getTipsForTab()

    return (
        <div className='min-h-screen pb-16'>
            {/* Header Section */}
            <div className='text-center text-2xl pt-10 text-gray-500 mb-8'>
                <p>HEALTH <span className='text-primary font-medium'>TIPS</span></p>
                <p className='text-sm text-gray-500 mt-2'>Your daily dose of wellness advice</p>
            </div>

            {/* Featured Tip of the Day */}
            <div className='mx-4 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white'>
                <div className='flex items-center gap-3 mb-3'>
                    <span className='text-4xl'>⭐</span>
                    <h2 className='text-xl font-bold'>Tip of the Day</h2>
                </div>
                <p className='text-lg mb-2'>Take the Stairs</p>
                <p className='text-sm opacity-90'>
                    Choose stairs over elevators whenever possible. It's a simple way to add extra physical
                    activity to your day, strengthen your leg muscles, and improve cardiovascular health!
                </p>
            </div>

            {/* Tabs */}
            <div className='flex justify-center gap-3 mb-8 px-4'>
                {['Daily', 'Nutrition', 'Wellness'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-6 rounded-full text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tips Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-4'>
                {currentTips.map((tip) => (
                    <div
                        key={tip.id}
                        className='border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:-translate-y-1'
                    >
                        <div className='flex items-start justify-between mb-3'>
                            <span className='text-4xl'>{tip.icon}</span>
                            <button
                                onClick={() => toggleLike(tip.id)}
                                className='text-2xl transition-transform hover:scale-125'
                            >
                                {likedTips.includes(tip.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <span className='inline-block bg-blue-50 text-primary text-xs font-medium px-3 py-1 rounded-full mb-3'>
                            {tip.category}
                        </span>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>{tip.title}</h3>
                        <p className='text-sm text-gray-600 leading-relaxed'>{tip.description}</p>
                    </div>
                ))}
            </div>

            {/* Weekly Challenge Section */}
            <div className='mx-4 mt-12 bg-green-50 border border-green-200 rounded-lg p-6'>
                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                    🏆 Weekly Challenge
                </h2>
                <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                        <input type='checkbox' className='w-5 h-5 accent-green-600' />
                        <span className='text-gray-700'>Walk 10,000 steps daily</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <input type='checkbox' className='w-5 h-5 accent-green-600' />
                        <span className='text-gray-700'>Drink 8 glasses of water every day</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <input type='checkbox' className='w-5 h-5 accent-green-600' />
                        <span className='text-gray-700'>Sleep 7-8 hours each night</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <input type='checkbox' className='w-5 h-5 accent-green-600' />
                        <span className='text-gray-700'>Eat 5 servings of fruits/vegetables</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <input type='checkbox' className='w-5 h-5 accent-green-600' />
                        <span className='text-gray-700'>Practice 10 minutes of meditation</span>
                    </div>
                </div>
                <div className='mt-4 pt-4 border-t border-green-200'>
                    <p className='text-sm text-gray-600'>
                        Complete these daily for 7 days to build healthy habits! 💪
                    </p>
                </div>
            </div>

            {/* Health Reminder */}
            <div className='mx-4 mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-5'>
                <div className='flex items-start gap-3'>
                    <span className='text-2xl'>💡</span>
                    <div>
                        <p className='font-semibold text-gray-800 mb-1'>Remember</p>
                        <p className='text-sm text-gray-600'>
                            These tips are for general wellness. Always consult with healthcare professionals
                            for personalized medical advice and before making significant lifestyle changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HealthTips
