import React from 'react'
import { useNavigate } from 'react-router-dom'

const Telemedicine = () => {
    const navigate = useNavigate()

    return (
        <div className='min-h-[80vh] flex flex-col items-center justify-center text-center px-4'>
            <div className='bg-white p-10 rounded-3xl shadow-luxury max-w-2xl w-full animate-fade-in-up'>
                <div className='text-6xl mb-6'>🏥</div>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                    Teleconsultation
                    <span className='block text-transparent bg-clip-text bg-gradient-primary mt-2 text-3xl md:text-4xl'>
                        Coming Soon!
                    </span>
                </h1>
                <p className='text-gray-600 text-lg mb-8 leading-relaxed'>
                    We are working hard to bring you instant video consultations with top specialists.
                    Soon you'll be able to connect with doctors from the comfort of your home.
                </p>
                <div className='p-6 bg-blue-50 rounded-2xl mb-8 border border-blue-100'>
                    <h3 className='font-semibold text-blue-800 mb-2'>What to expect:</h3>
                    <ul className='text-blue-700 text-sm space-y-2 text-left max-w-xs mx-auto list-disc pl-5'>
                        <li>Instant Video Calls</li>
                        <li>Digital Prescriptions</li>
                        <li>24/7 Specialist Access</li>
                        <li>Secure Health Records</li>
                    </ul>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <button
                        onClick={() => navigate('/doctors')}
                        className='bg-gradient-primary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300'
                    >
                        Find a Doctor
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

export default Telemedicine
