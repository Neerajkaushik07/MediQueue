import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, iconColorClass, onClick, loading = false }) => {
    const clickable = typeof onClick === 'function'

    return (
        <div
            className={`glass-card p-6 rounded-2xl transition-all ${colorClass || ''} ${clickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
            onClick={onClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(e) => {
                if (!clickable) return
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            aria-label={clickable ? `Open ${title}` : undefined}
        >
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-gray-700 dark:text-gray-200 font-semibold'>{title}</h3>
                {Icon && <Icon className={`text-2xl ${iconColorClass}`} />}
            </div>
            <p className='text-3xl font-bold text-gray-800 dark:text-gray-100'>{loading ? '--' : value}</p>
            {subtext && <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>{subtext}</p>}
        </div>
    );
};

export default StatCard;
