import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, iconColorClass }) => {
    return (
        <div className={`glass-card p-6 rounded-2xl ${colorClass || ''}`}>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-gray-700 font-semibold'>{title}</h3>
                {Icon && <Icon className={`text-2xl ${iconColorClass}`} />}
            </div>
            <p className='text-3xl font-bold text-gray-800'>{value}</p>
            {subtext && <p className='text-sm text-gray-500 mt-2'>{subtext}</p>}
        </div>
    );
};

export default StatCard;
