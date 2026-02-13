import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData()
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)
            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return userData ? (
        <div className='max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl border border-gray-100 font-sans'>

            {/* Header Section */}
            <div className='flex flex-col md:flex-row items-center gap-8 mb-8'>
                {isEdit ? (
                    <label htmlFor='image' className='relative cursor-pointer group'>
                        <img className='w-40 h-40 rounded-full object-cover opacity-75 group-hover:opacity-50 transition-opacity' src={image ? URL.createObjectURL(image) : userData.image} alt="Profile" />
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <img className='w-10 h-10 p-2 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity' src={assets.upload_icon} alt="Upload" />
                        </div>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                    </label>
                ) : (
                    <img className='w-40 h-40 rounded-full object-cover shadow-md' src={userData.image} alt="Profile" />
                )}

                <div className='flex-1 text-center md:text-left'>
                    {isEdit ? (
                        <input className='text-3xl font-bold text-gray-800 border-b-2 border-primary focus:outline-none bg-transparent w-full md:w-auto' type="text"
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                            value={userData.name}
                            placeholder="Your Name"
                        />
                    ) : (
                        <h1 className='text-3xl font-bold text-gray-800'>{userData.name}</h1>
                    )}
                    <p className='text-gray-500 mt-1 text-lg'>Patient Profile</p>
                </div>

                <div className='mt-4 md:mt-0'>
                    {isEdit ? (
                        <div className='flex gap-3'>
                            <button onClick={updateUserProfileData} className='bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md'>
                                Save Changes
                            </button>
                            <button onClick={() => setIsEdit(false)} className='bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors'>
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEdit(true)} className='border-2 border-primary text-primary px-8 py-2 rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300'>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Contact Information */}
                <div className='bg-gray-50 p-6 rounded-lg border border-gray-100'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                        <span className='w-1 h-6 bg-primary rounded-full'></span>
                        Contact Information
                    </h2>
                    <div className='space-y-4'>
                        <div>
                            <p className='text-sm text-gray-500 mb-1'>Email Address</p>
                            <p className='text-gray-800 font-medium'>{userData.email}</p>
                        </div>
                        <div>
                            <p className='text-sm text-gray-500 mb-1'>Phone Number</p>
                            {isEdit ? (
                                <input className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all' type="text"
                                    onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                                    value={userData.phone}
                                />
                            ) : (
                                <p className='text-gray-800 font-medium'>{userData.phone}</p>
                            )}
                        </div>
                        <div>
                            <p className='text-sm text-gray-500 mb-1'>Address</p>
                            {isEdit ? (
                                <div className='space-y-2'>
                                    <input className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all' type="text"
                                        onChange={(e) => setUserData(prev => ({
                                            ...prev,
                                            address: { ...(prev.address || {}), line1: e.target.value }
                                        }))}
                                        value={userData.address?.line1 || ''}
                                        placeholder="Address Line 1"
                                    />
                                    <input className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all' type="text"
                                        onChange={(e) => setUserData(prev => ({
                                            ...prev,
                                            address: { ...(prev.address || {}), line2: e.target.value }
                                        }))}
                                        value={userData.address?.line2 || ''}
                                        placeholder="Address Line 2"
                                    />
                                </div>
                            ) : (
                                <p className='text-gray-800 font-medium'>
                                    {userData.address?.line1}
                                    {userData.address?.line2 && <><br />{userData.address?.line2}</>}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className='bg-gray-50 p-6 rounded-lg border border-gray-100'>
                    <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                        <span className='w-1 h-6 bg-primary rounded-full'></span>
                        Basic Information
                    </h2>
                    <div className='space-y-4'>
                        <div>
                            <p className='text-sm text-gray-500 mb-1'>Gender</p>
                            {isEdit ? (
                                <select className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all cursor-pointer'
                                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                                    value={userData.gender}
                                >
                                    <option value="Not Selected">Not Selected</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            ) : (
                                <p className='text-gray-800 font-medium'>{userData.gender}</p>
                            )}
                        </div>
                        <div>
                            <p className='text-sm text-gray-500 mb-1'>Date of Birth</p>
                            {isEdit ? (
                                <input className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all' type='date'
                                    onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                                    value={userData.dob}
                                />
                            ) : (
                                <p className='text-gray-800 font-medium'>{userData.dob}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null
}

export default MyProfile
