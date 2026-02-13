import React from 'react'
import { useNavigate } from 'react-router-dom'

const Community = () => {
    const navigate = useNavigate()

    return (
        <div className='min-h-[80vh] flex flex-col items-center justify-center text-center px-4'>
            <div className='bg-white p-10 rounded-3xl shadow-luxury max-w-2xl w-full animate-fade-in-up'>
                <div className='text-6xl mb-6'>👥</div>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                    Community
                    <span className='block text-transparent bg-clip-text bg-gradient-primary mt-2 text-3xl md:text-4xl'>
                        Coming Soon!
                    </span>
                </h1>
                <p className='text-gray-600 text-lg mb-8 leading-relaxed'>
                    Join our vibrant community to connect with other patients. Share experiences, discuss top-rated doctors, and exchange home remedies for a healthier life.
                </p>
                <div className='p-6 bg-blue-50 rounded-2xl mb-8 border border-blue-100'>
                    <h3 className='font-semibold text-blue-800 mb-2'>What to expect:</h3>
                    <ul className='text-blue-700 text-sm space-y-2 text-left max-w-xs mx-auto list-disc pl-5'>
                        <li>Doctor Recommendations</li>
                        <li>Home Remedies Sharing</li>
                        <li>Patient Support Groups</li>
                        <li>Health Discussions</li>
                    </ul>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <button
                        onClick={() => navigate('/health-blog')}
                        className='bg-gradient-primary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300'
                    >
                        Read Health Blog
                    </button>
                    <button
                        onClick={() => navigate('/features')}
                        className='px-8 py-3 rounded-full font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-300'
                    >
                        Back to Features
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Community
