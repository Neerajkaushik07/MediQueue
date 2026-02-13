import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const DashboardHeader = ({ name, subtitle, image, status, onStatusToggle }) => {
    return (
        <div className='glass-card p-8 rounded-3xl mb-8 bg-gradient-to-r from-primary/10 to-purple-500/10'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
                <div className='flex items-center gap-6'>
                    <img
                        src={image || '/default-avatar.png'}
                        alt="Profile"
                        className='w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover'
                    />
                    <div className='text-center md:text-left'>
                        <h1 className='text-3xl font-bold luxury-heading mb-2'>
                            Welcome, {name}!
                        </h1>
                        <p className='text-gray-600'>{subtitle}</p>
                    </div>
                </div>

                {status && (
                    <div className='text-center md:text-right'>
                        <p className='text-sm text-gray-600 mb-2'>{status.label}</p>
                        <button
                            onClick={onStatusToggle}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${status.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                        >
                            {status.icon}
                            {status.text}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;
