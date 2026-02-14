import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const DoctorProfile = () => {
    const { backendUrl, token, userRole, currencySymbol, isDemoMode, userData } = useContext(AppContext)
    const [profileData, setProfileData] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(true)

    const getProfile = useCallback(async () => {
        try {
            if (isDemoMode) {
                setProfileData(userData)
                setLoading(false)
                return
            }
            if (userRole === 'doctor' && token) {
                const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { Authorization: `Bearer ${token}` } })
                if (data.success) {
                    setProfileData(data.profileData)
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {

            toast.error(error.message || 'Failed to load profile')
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, userRole, isDemoMode])

    const updateProfile = async () => {
        if (isDemoMode) {
            toast.info('Changes cannot be saved in Demo Mode')
            setIsEdit(false)
            return
        }
        try {
            const updateData = {
                docId: profileData._id,
                fees: profileData.fees,
                address: profileData.address,
                available: profileData.available,
                about: profileData.about,
                name: profileData.name,
                phone: profileData.phone,
                languages: profileData.languages || [],
                qualifications: profileData.qualifications || [],
                awards: profileData.awards || [],
                insurance: profileData.insurance || {}
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                toast.success('Professional Profile Updated')
                setIsEdit(false)
                getProfile()
            } else {
                toast.error(data.message)
            }

        } catch (error) {

            toast.error(error.message || 'Failed to update profile')
        }
    }

    useEffect(() => {
        getProfile()
    }, [getProfile])

    // Derived Professional Stats
    const stats = useMemo(() => [
        { label: 'Success Rate', value: '98%', icon: '📈', color: 'bg-emerald-50 text-emerald-600', trend: '+2.4%' },
        { label: 'Consultations', value: '1,240+', icon: '🤝', color: 'bg-blue-50 text-blue-600', trend: 'Total' },
        { label: 'Experience', value: `${profileData?.experience || 0} Yrs`, icon: '🎓', color: 'bg-indigo-50 text-indigo-600', trend: 'Professional' },
        { label: 'Avg. Rating', value: '4.9', icon: '⭐', color: 'bg-amber-50 text-amber-600', trend: 'High' }
    ], [profileData])

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className='relative'>
                    <div className='w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin'></div>
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='w-8 h-8 bg-primary/20 rounded-full animate-pulse'></div>
                    </div>
                </div>
            </div>
        )
    }

    return profileData && (
        <div className='m-5 max-w-7xl mx-auto space-y-8 animate-fade-in-up'>
            {/* Professional Header */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                <div>
                    <h1 className='text-4xl font-black text-gray-900 font-outfit tracking-tight'>Professional Identity</h1>
                    <p className='text-gray-500 mt-2 flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-primary animate-pulse'></span>
                        Verified Medical Practitioner • Ref ID: #{profileData._id.slice(-6).toUpperCase()}
                    </p>
                </div>
                <div className='flex gap-4'>
                    {isEdit ? (
                        <>
                            <button onClick={() => setIsEdit(false)} className='px-8 py-3 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all'>Cancel</button>
                            <button onClick={updateProfile} className='px-8 py-3 rounded-2xl bg-gradient-primary text-white font-bold shadow-medical hover:shadow-card hover:-translate-y-1 transition-all'>Save Profile</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEdit(true)} className='px-8 py-3 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2'>
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' /></svg>
                            Edit Credentials
                        </button>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                {/* Left: Professional Card */}
                <div className='lg:col-span-4 space-y-8'>
                    <div className='bg-white rounded-[3rem] shadow-card border border-gray-100 overflow-hidden group'>
                        <div className='h-40 bg-gradient-to-br from-primary to-indigo-600 relative overflow-hidden'>
                            <div className='absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:20px_20px]'></div>
                            <div className='absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl'></div>
                        </div>
                        <div className='px-8 pb-10 relative'>
                            <div className='-mt-20 mb-6 flex justify-center'>
                                <div className='relative group/img'>
                                    <div className='absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500'></div>
                                    <img
                                        src={profileData.image}
                                        className='w-40 h-40 rounded-[2.5rem] object-cover border-8 border-white shadow-xl relative z-10'
                                        alt={profileData.name}
                                    />
                                    <div className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-4 border-white z-20 ${profileData.available ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                </div>
                            </div>

                            <div className='text-center space-y-4'>
                                {isEdit ? (
                                    <div className='space-y-4'>
                                        <input
                                            value={profileData.name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                            className='w-full text-center text-2xl font-black text-gray-900 bg-gray-50 border border-gray-100 rounded-2xl py-2 focus:outline-none'
                                        />
                                        <div className='grid grid-cols-2 gap-3'>
                                            <input
                                                value={profileData.degree}
                                                placeholder="Degree"
                                                onChange={(e) => setProfileData(prev => ({ ...prev, degree: e.target.value }))}
                                                className='bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-center'
                                            />
                                            <input
                                                value={profileData.experience}
                                                placeholder="Years"
                                                onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                                                className='bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-center'
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h2 className='text-3xl font-black text-gray-900 font-outfit uppercase tracking-tight'>{profileData.name}</h2>
                                            <p className='text-primary font-bold text-lg mt-1'>{profileData.speciality}</p>
                                        </div>
                                        <div className='flex items-center justify-center gap-3'>
                                            <span className='px-4 py-1.5 bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest rounded-full border border-gray-100'>{profileData.degree}</span>
                                            <span className='w-1.5 h-1.5 rounded-full bg-gray-300'></span>
                                            <span className='text-gray-400 text-sm font-bold'>{profileData.experience} Years Experience</span>
                                        </div>
                                    </>
                                )}

                                <div className={`p-5 rounded-[2rem] transition-all duration-500 border ${profileData.available ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-sm font-black text-gray-600 uppercase tracking-widest'>Availability Status</span>
                                        <label className='relative inline-flex items-center cursor-pointer'>
                                            <input type="checkbox" checked={profileData.available} onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} className="sr-only peer" disabled={!isEdit} />
                                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>
                                    <p className={`text-xs text-left ${profileData.available ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {profileData.available ? 'Active: Patients can book through the marketplace.' : 'Inactive: Hidden from primary search results.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Practice Details */}
                    <div className='bg-white rounded-[2.5rem] shadow-card border border-gray-100 p-8 space-y-6'>
                        <h3 className='text-xl font-black text-gray-900 font-outfit uppercase tracking-widest'>Practice Details</h3>
                        <div className='space-y-6'>
                            <div className='flex items-start gap-4'>
                                <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 text-xl'>📍</div>
                                <div className='flex-1'>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1'>Clinic Address</p>
                                    {isEdit ? (
                                        <div className='space-y-2'>
                                            <input value={profileData.address.line1} onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} className='w-full bg-gray-50 p-2 rounded-lg text-sm' placeholder="Street" />
                                            <input value={profileData.address.line2} onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} className='w-full bg-gray-50 p-2 rounded-lg text-sm' placeholder="City, Zip" />
                                        </div>
                                    ) : (
                                        <p className='text-gray-700 font-bold'>{profileData.address.line1}<br /><span className='text-gray-400 font-medium text-sm'>{profileData.address.line2}</span></p>
                                    )}
                                </div>
                            </div>

                            <div className='flex items-start gap-4'>
                                <div className='w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 text-xl'>🗣️</div>
                                <div className='flex-1'>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1'>Languages</p>
                                    {isEdit ? (
                                        <input value={profileData.languages?.join(', ')} onChange={(e) => setProfileData(prev => ({ ...prev, languages: e.target.value.split(',').map(s => s.trim()) }))} className='w-full bg-gray-50 p-2 rounded-lg text-sm font-bold' placeholder="Comma separated" />
                                    ) : (
                                        <div className='flex flex-wrap gap-2'>
                                            {profileData.languages?.map(lang => (
                                                <span key={lang} className='px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest'>{lang}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Performance & Credentials */}
                <div className='lg:col-span-8 space-y-8'>
                    {/* Performance Stats Grid */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {stats.map((stat, index) => (
                            <div key={index} className='bg-white p-6 rounded-[2rem] shadow-card border border-gray-100 group hover:shadow-medical transition-all duration-300'>
                                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1'>{stat.label}</p>
                                <div className='flex items-baseline gap-2'>
                                    <h4 className='text-2xl font-black text-gray-900 font-outfit'>{stat.value}</h4>
                                    <span className='text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full'>{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* About Practitioner */}
                    <div className='bg-white rounded-[3rem] shadow-card border border-gray-100 p-10 relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl'></div>
                        <div className='relative z-10'>
                            <h3 className='text-2xl font-black text-gray-900 font-outfit uppercase tracking-tight mb-6 flex items-center gap-3'>
                                <span className='w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm italic font-serif'>i</span>
                                Professional Summary
                            </h3>
                            {isEdit ? (
                                <textarea
                                    rows={6}
                                    value={profileData.about}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                                    className='w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-gray-700 leading-relaxed focus:outline-none'
                                    placeholder="Briefly describe your medical philosophy and expertise..."
                                />
                            ) : (
                                <p className='text-gray-600 text-lg leading-relaxed italic font-medium'>" {profileData.about} "</p>
                            )}
                        </div>
                    </div>

                    {/* Credentials & Insurance Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Qualifications / Awards */}
                        <div className='space-y-8'>
                            <div className='bg-white rounded-[2.5rem] shadow-card border border-gray-100 p-8'>
                                <h3 className='text-lg font-black text-gray-900 font-outfit uppercase tracking-widest mb-6 flex items-center gap-2'>
                                    <span className='text-xl'>🏆</span> Recognition
                                </h3>
                                <div className='space-y-4'>
                                    {isEdit ? (
                                        <textarea value={profileData.awards?.join(', ')} onChange={(e) => setProfileData(prev => ({ ...prev, awards: e.target.value.split(',').map(s => s.trim()) }))} className='w-full bg-gray-50 rounded-xl p-3 text-sm' placeholder="Separate by commas" />
                                    ) : (
                                        profileData.awards?.map(award => (
                                            <div key={award} className='flex gap-4 items-center p-3 bg-rose-50 rounded-2xl border border-rose-100'>
                                                <div className='w-2 h-2 rounded-full bg-rose-500'></div>
                                                <span className='text-sm font-bold text-rose-700'>{award}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Indemnity Insurance */}
                        <div className='bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl'>
                            <div className='absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent'></div>
                            <div className='relative z-10'>
                                <div className='flex justify-between items-center mb-8'>
                                    <h3 className='font-black font-outfit uppercase tracking-widest text-indigo-400'>Indemnity Shield</h3>
                                    <div className='px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-tighter text-emerald-400'>Active Layer</div>
                                </div>

                                {isEdit ? (
                                    <div className='space-y-4'>
                                        <input
                                            value={profileData.insurance?.provider}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, insurance: { ...prev.insurance, provider: e.target.value } }))}
                                            className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm' placeholder="Insurer"
                                        />
                                        <input
                                            value={profileData.insurance?.policyNo}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, insurance: { ...prev.insurance, policyNo: e.target.value } }))}
                                            className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm' placeholder="Policy #"
                                        />
                                    </div>
                                ) : (
                                    <div className='space-y-6'>
                                        <div className='flex justify-between'>
                                            <span className='text-white/40 text-xs font-bold uppercase'>Carrier</span>
                                            <span className='font-black text-indigo-100'>{profileData.insurance?.provider || 'Medical Shield Pro'}</span>
                                        </div>
                                        <div className='flex justify-between'>
                                            <span className='text-white/40 text-xs font-bold uppercase'>Policy Ref</span>
                                            <span className='font-mono text-indigo-300'>{profileData.insurance?.policyNo || 'MS-77428-AQ'}</span>
                                        </div>
                                        <div className='mt-8 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10'>
                                            <div className='w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-xl'>🛡️</div>
                                            <div>
                                                <p className='text-[10px] font-black text-indigo-300 uppercase'>Coverage Tier</p>
                                                <p className='text-sm font-bold'>Professional Liability 360</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Consultation Economics */}
                    <div className='bg-gradient-primary rounded-[3rem] p-10 text-white shadow-medical flex flex-col md:flex-row justify-between items-center gap-8'>
                        <div className='space-y-2 text-center md:text-left'>
                            <h3 className='text-2xl font-black font-outfit tracking-tight'>Strategic Consultation Fee</h3>
                            <p className='text-white/70'>Standard professional compensation per procedural event</p>
                        </div>
                        <div className='flex items-center gap-6'>
                            {isEdit ? (
                                <div className='relative'>
                                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-black'>{currencySymbol}</span>
                                    <input
                                        type="number"
                                        value={profileData.fees}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                                        className='bg-white/10 border-2 border-white/20 rounded-[2rem] pl-10 pr-6 py-4 text-3xl font-black w-48 text-center focus:outline-none'
                                    />
                                </div>
                            ) : (
                                <div className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] px-10 py-6 text-center transform group-hover:scale-105 transition-all'>
                                    <span className='text-white/60 text-xs font-black uppercase tracking-widest block mb-2'>Base Rate</span>
                                    <span className='text-5xl font-black font-outfit'>{currencySymbol}{profileData.fees}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .font-outfit { font-family: 'Outfit', sans-serif; }
                .tracking-tight { letter-spacing: -0.025em; }
            `}} />
        </div>
    )
}

export default DoctorProfile
