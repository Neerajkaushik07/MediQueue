import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const AppointmentList = ({ appointments, title = "Recent Appointments", onViewAll, emptyMessage = "No appointments found" }) => {
    return (
        <div className='glass-card p-8 rounded-3xl'>
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold'>{title}</h2>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className='text-primary hover:text-purple-600 font-semibold transition-colors'
                    >
                        View All →
                    </button>
                )}
            </div>

            {appointments && appointments.length > 0 ? (
                <div className='space-y-4'>
                    {appointments.map((appointment, index) => {
                        // Determine display data based on role (patient sees doctor, doctor sees patient)
                        const displayUser = appointment.docData || appointment.userData;

                        return (
                            <div key={index} className='flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4'>
                                <div className='flex items-center gap-4 w-full sm:w-auto'>
                                    <img
                                        src={displayUser?.image || '/default-avatar.png'}
                                        alt={displayUser?.name}
                                        className='w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm'
                                    />
                                    <div>
                                        <h3 className='font-semibold text-gray-800'>{displayUser?.name}</h3>
                                        <p className='text-sm text-gray-600'>{displayUser?.speciality || displayUser?.email}</p>
                                    </div>
                                </div>
                                <div className='text-right w-full sm:w-auto'>
                                    <p className='text-sm font-semibold text-gray-700'>
                                        {appointment.slotDate?.replace(/_/g, '-')}
                                    </p>
                                    <p className='text-sm text-gray-600'>{appointment.slotTime}</p>
                                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${appointment.cancelled ? 'bg-red-100 text-red-600' :
                                        appointment.isCompleted ? 'bg-green-100 text-green-600' :
                                            appointment.payment ? 'bg-blue-100 text-blue-600' :
                                                'bg-yellow-100 text-yellow-600' // Default / Pending
                                        }`}>
                                        {appointment.cancelled ? 'Cancelled' :
                                            appointment.isCompleted ? 'Completed' :
                                                appointment.payment ? 'Paid' : 'Upcoming'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='text-center py-12'>
                    <FaCalendarAlt className='text-6xl text-gray-300 mx-auto mb-4' />
                    <p className='text-gray-500'>{emptyMessage}</p>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
