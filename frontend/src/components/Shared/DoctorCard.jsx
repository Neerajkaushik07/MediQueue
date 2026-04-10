import React from 'react'
import { useNavigate } from 'react-router-dom'

const DoctorCard = ({ doctor }) => {
    const navigate = useNavigate()

    return (
        <div
            onClick={() => navigate(`/appointment/${doctor._id}`)}
            className="doctor-card-enhanced animate-fade-in-up cursor-pointer group"
        >
            <div className="doctor-image-wrapper relative overflow-hidden rounded-t-xl bg-blue-50">
                <img
                    className="doctor-image w-full h-48 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    src={doctor.image}
                    alt={doctor.name}
                />
                <div className={`status-badge absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${doctor.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {doctor.available ? 'Available' : 'Unavailable'}
                </div>
            </div>
            <div className="doctor-info p-4 bg-white border border-t-0 border-gray-100 rounded-b-xl shadow-sm group-hover:shadow-md transition-shadow">
                <h3 className="doctor-name text-lg font-semibold text-gray-900 truncate">{doctor.name}</h3>
                <p className="doctor-specialty text-sm text-gray-600 mb-3">{doctor.speciality}</p>

                <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-gray-500">
                    <span className="badge-specialty flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        {doctor.degree}
                    </span>
                    {doctor.experience && (
                        <span className="badge-experience flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {doctor.experience}
                        </span>
                    )}
                </div>

                {doctor.fees && (
                    <div className="fee-display mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-sm">
                        <span className="fee-label text-gray-500">Consultation Fee</span>
                        <span className="fee-amount font-semibold text-gray-900">₹{doctor.fees}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorCard