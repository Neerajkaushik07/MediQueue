import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionGrid = ({ actions }) => {
    const navigate = useNavigate();

    return (
        <div className='mb-8'>
            <h2 className='text-2xl font-bold mb-6'>Quick Actions</h2>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => action.onClick ? action.onClick() : navigate(action.path)}
                        className='glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 group text-center md:text-left flex flex-col items-center md:items-start'
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                            <action.icon className='text-white text-xl' />
                        </div>
                        <p className='text-sm font-semibold text-gray-700'>{action.title}</p>
                        {action.subtitle && <p className='text-xs text-gray-500 mt-1'>{action.subtitle}</p>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ActionGrid;
