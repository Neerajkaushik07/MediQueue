import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Banner = () => {

    const navigate = useNavigate()
    const { token } = useContext(AppContext)

    if (token) {
        return null
    }

    return (
        <div className='relative overflow-hidden bg-gradient-primary rounded-3xl'>
            <div className='absolute inset-0 opacity-10 bg-pattern-medical' style={{ backgroundSize: '20px 20px' }}></div>

            <div className='relative flex flex-col md:flex-row items-center px-6 sm:px-10 md:px-14 lg:px-12 py-12 gap-8'>
                {/* ------- Left Side ------- */}
                <div className='flex-1 text-center md:text-left'>
                    <div className='mb-4'>
                        <span className='inline-block px-4 py-2 bg-gradient-calm rounded-full text-gray-900 text-sm font-semibold'>
                            Join Our Healthcare Community
                        </span>
                    </div>
                    <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                        Start Your Health Journey Today
                    </h2>
                    <p className='text-gray-700 text-lg max-w-lg leading-relaxed mb-6'>
                        Connect with 100+ trusted doctors and experience professional healthcare with convenient online booking.
                    </p>
                    <button
                        onClick={() => { navigate('/login'); scrollTo(0, 0) }}
                        className='bg-gradient-calm text-gray-900 px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 inline-flex items-center gap-2'
                    >
                        <span>Create Account</span>
                        <svg className='w-5 h-5' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>

                {/* ------- Right Side ------- */}
                <div className='md:w-1/2 lg:w-[370px] relative'>
                    <img className='w-full max-w-sm mx-auto' src={assets.appointment_img} alt="Book Appointment" />
                </div>
            </div>
        </div>
    )
}

export default Banner
