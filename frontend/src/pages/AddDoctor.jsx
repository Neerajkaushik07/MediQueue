import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { specialities } from '../assets/assets'
import { FaCloudUploadAlt, FaUserMd, FaStethoscope, FaGraduationCap, FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa'

const AddDoctor = () => {
    const { backendUrl, token } = useContext(AppContext)

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (!docImg) {
                return toast.error('Please Select Doctor Image')
            }

            const formData = new FormData()

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)

        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full max-w-5xl mx-auto animate-fade-in'>
            <div className='flex items-center gap-4 mb-8 bg-white/50 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-sm'>
                <div className='p-3 bg-primary/10 rounded-2xl'>
                    <FaUserMd className='text-3xl text-primary' />
                </div>
                <div>
                    <h1 className='text-3xl font-bold text-gray-800 luxury-heading'>Add Doctor</h1>
                    <p className='text-gray-500 font-medium'>Create a new professional profile for the platform</p>
                </div>
            </div>

            <div className='glass-card p-10 rounded-[2rem] shadow-luxury'>
                <div className='flex flex-col lg:flex-row gap-12'>
                    {/* Left Side: Photo Upload */}
                    <div className='flex flex-col items-center gap-4 lg:border-r border-gray-100 lg:pr-12'>
                        <label htmlFor='doc-img' className='relative group cursor-pointer'>
                            <div className='w-48 h-48 rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 group-hover:border-primary transition-all flex items-center justify-center relative'>
                                {docImg ? (
                                    <img className='w-full h-full object-cover' src={URL.createObjectURL(docImg)} alt="" />
                                ) : (
                                    <div className='text-center p-4'>
                                        <FaCloudUploadAlt className='text-5xl text-gray-400 group-hover:text-primary transition-colors mx-auto mb-2' />
                                        <p className='text-sm font-semibold text-gray-500'>Upload Photo</p>
                                    </div>
                                )}
                                <div className='absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                    <p className='text-white font-bold text-sm'>Change Photo</p>
                                </div>
                            </div>
                        </label>
                        <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
                        <p className='text-xs text-gray-400 font-medium text-center uppercase tracking-wider'>Max 5MB • JPG/PNG</p>
                    </div>

                    {/* Right Side: Form Fields */}
                    <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6'>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaUserMd className='text-primary' /> Doctor Name</label>
                            <input onChange={(e) => setName(e.target.value)} value={name} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="text" placeholder='Dr. Jane Doe' required />
                        </div>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaStethoscope className='text-primary' /> Speciality</label>
                            <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800 cursor-pointer'>
                                {specialities.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaBriefcase className='text-primary' /> Doctor Email</label>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="email" placeholder='doctor@mediqueue.com' required />
                        </div>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaGraduationCap className='text-primary' /> Education / Degree</label>
                            <input onChange={(e) => setDegree(e.target.value)} value={degree} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="text" placeholder='MBBS, MD (Neurology)' required />
                        </div>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'>Set Password</label>
                            <input onChange={(e) => setPassword(e.target.value)} value={password} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="password" placeholder='••••••••' required />
                        </div>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'>Experience</label>
                            <select onChange={(e) => setExperience(e.target.value)} value={experience} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800 cursor-pointer'>
                                {[...Array(20)].map((_, i) => (
                                    <option key={i} value={`${i + 1} Year`}>{i + 1} Year{i > 0 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className='space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaMoneyBillWave className='text-primary' /> Consultation Fees (₹)</label>
                            <input onChange={(e) => setFees(e.target.value)} value={fees} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="number" placeholder='500' required />
                        </div>

                        <div className='space-y-2 md:col-span-1'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaMapMarkerAlt className='text-primary' /> Clinic Address Line 1</label>
                            <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="text" placeholder='123 Medical Center' required />
                        </div>

                        <div className='space-y-2 md:col-span-1'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaMapMarkerAlt className='text-primary invisible' /> Clinic Address Line 2</label>
                            <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' type="text" placeholder='Street, Area' required />
                        </div>

                        <div className='md:col-span-2 space-y-2'>
                            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 ml-1'><FaInfoCircle className='text-primary' /> About Doctor</label>
                            <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='glass border-0 rounded-2xl w-full p-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800' rows={4} placeholder='Tell patients about this professional experience and expertise...' required />
                        </div>
                    </div>
                </div>

                <div className='mt-12 flex justify-end'>
                    <button type="submit" className='bg-gradient-to-r from-primary to-purple-600 text-white px-12 py-4 rounded-2xl text-lg font-bold hover:shadow-glow transition-all duration-300 hover:scale-[1.02] btn-glow flex items-center gap-3'>
                        <FaUserMd /> Create Doctor Profile
                    </button>
                </div>
            </div>
        </form>
    )
}

export default AddDoctor
