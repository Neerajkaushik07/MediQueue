import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { FaUserMd, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const DemoAccess = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { loginAsPatientDemo, loginAsDoctorDemo } = useContext(AppContext)
    const navigate = useNavigate()

    const handlePatientDemo = () => {
        loginAsPatientDemo()
        setIsOpen(false)
        navigate('/patient-dashboard')
    }

    const handleDoctorDemo = () => {
        loginAsDoctorDemo()
        setIsOpen(false)
        navigate('/doctor-dashboard')
    }

    return (
        <div className='fixed bottom-6 right-6 z-50'>
            {/* Dropdown Menu */}
            {isOpen && (
                <div className='demo-dropdown absolute bottom-full right-0 mb-4 min-w-[560px]'>
                    <div className='glass-card rounded-2xl shadow-2xl overflow-hidden border border-primary/20'>
                        {/* Header */}
                        <div className='bg-gradient-to-r from-primary to-purple-600 text-white px-5 py-3 text-center'>
                            <h3 className='font-bold text-base'>
                                Choose Demo Profile
                            </h3>
                            <p className='text-xs text-white/90 mt-1'>
                                Explore all features instantly
                            </p>
                        </div>

                        {/* Options - Horizontal Layout */}
                        <div className='p-4 flex gap-3'>
                            {/* Patient Demo */}
                            <button
                                onClick={handlePatientDemo}
                                className='demo-option flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 group'
                            >
                                <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform'>
                                    <FaUser className='text-primary text-2xl' />
                                </div>
                                <div className='text-center'>
                                    <h4 className='font-semibold text-gray-900 group-hover:text-primary transition-colors text-base'>
                                        Patient Demo
                                    </h4>
                                    <p className='text-xs text-gray-600 mt-1'>
                                        Explore patient features
                                    </p>
                                </div>
                            </button>

                            {/* Doctor Demo */}
                            <button
                                onClick={handleDoctorDemo}
                                className='demo-option flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 group'
                            >
                                <div className='w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform'>
                                    <FaUserMd className='text-primary text-2xl' />
                                </div>
                                <div className='text-center'>
                                    <h4 className='font-semibold text-gray-900 group-hover:text-primary transition-colors text-base'>
                                        Doctor Demo
                                    </h4>
                                    <p className='text-xs text-gray-600 mt-1'>
                                        Explore doctor features
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Footer Note */}
                        <div className='px-5 py-2 bg-gray-50 border-t border-gray-100'>
                            <p className='text-xs text-gray-600 text-center'>
                                💡 No login required • Full feature access
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Text Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='demo-access-button group relative px-5 py-3 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white shadow-2xl hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2'
            >
                {/* Animated Background */}
                <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full'></div>

                {/* Text */}
                <div className='relative z-10 flex items-center gap-2'>
                    {isOpen ? (
                        <span className='font-semibold text-sm whitespace-nowrap'>Close</span>
                    ) : (
                        <span className='font-semibold text-sm whitespace-nowrap'>Demo Profiles</span>
                    )}
                </div>

                {/* Pulse Effect */}
                <span className='absolute inset-0 rounded-full bg-primary animate-ping opacity-20'></span>
            </button>
        </div>
    )
}

export default DemoAccess
