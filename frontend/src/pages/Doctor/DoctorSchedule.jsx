import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const WheelPicker = ({ value, onChange, options, label }) => {
    const scrollRef = useRef(null);
    const itemHeight = 32;

    useEffect(() => {
        if (scrollRef.current) {
            const index = options.indexOf(value);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [value, options]);

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (options[index] !== undefined && options[index] !== value) {
            onChange(options[index]);
        }
    };

    return (
        <div className='flex flex-col items-center flex-1 group/wheel min-w-[55px]'>
            <span className='text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1.5 group-hover/wheel:text-primary transition-all duration-300'>{label}</span>
            <div className='relative h-[110px] w-full overflow-hidden bg-white rounded-xl border border-gray-100 shadow-[inset_0_1px_5px_rgba(0,0,0,0.01)]'>
                <div className='absolute inset-0 pointer-events-none z-20'>
                    <div className='absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white via-white/40 to-transparent'></div>
                    <div className='absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/40 to-transparent'></div>
                    <div className='absolute top-1/2 left-0.5 right-0.5 h-[32px] -translate-y-1/2 bg-primary/5 border border-primary/10 rounded-lg pointer-events-none'></div>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className='h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative z-10 py-[39px]'
                >
                    {options.map((opt, i) => {
                        const isSelected = opt === value;
                        return (
                            <div
                                key={i}
                                className='h-[32px] flex items-center justify-center snap-center'
                            >
                                <span className={`text-sm font-poppins transition-all duration-200 ${isSelected
                                    ? 'text-primary font-black scale-105'
                                    : 'text-gray-300 font-bold scale-90 opacity-30'
                                    }`}>
                                    {opt}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const DoctorSchedule = () => {
    const { backendUrl, token, userRole, isDemoMode } = useContext(AppContext)
    const [scheduleData, setScheduleData] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [is24Hour, setIs24Hour] = useState(true)

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const hours24 = Array.from({ length: 24 }, (_, i) => i < 10 ? `0${i}` : `${i}`);
    const hours12 = Array.from({ length: 12 }, (_, i) => i === 0 ? '12' : i < 10 ? `0${i}` : `${i}`);
    const minutes = Array.from({ length: 60 }, (_, i) => i < 10 ? `0${i}` : `${i}`);
    const durations = Array.from({ length: 60 }, (_, i) => i + 1);
    const ampm = ['AM', 'PM'];

    const getSchedule = useCallback(async () => {
        try {
            if (isDemoMode) {
                setScheduleData({
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    startTime: '09:00',
                    endTime: '17:00',
                    slotDuration: 30
                })
                return
            }
            if (userRole === 'doctor' && token) {
                const { data } = await axios.get(backendUrl + '/api/doctor/schedule', { headers: { Authorization: `Bearer ${token}` } })
                if (data.success && data.schedule) {
                    setScheduleData(data.schedule)
                } else {
                    setScheduleData({
                        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                        startTime: '09:00',
                        endTime: '17:00',
                        slotDuration: 30
                    })
                }
            }
        } catch (error) {

            setScheduleData({
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30
            })
        }
    }, [backendUrl, token, userRole, isDemoMode])

    const toggleWorkingDay = (day) => {
        if (!isEdit) return
        setScheduleData(prev => {
            const workingDays = (prev.workingDays || []).includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...(prev.workingDays || []), day]
            return { ...prev, workingDays }
        })
    }

    const updateSchedule = async () => {
        if (isDemoMode) {
            toast.info('Changes cannot be saved in Demo Mode')
            setIsEdit(false)
            return
        }
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/update-schedule',
                scheduleData,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success) {
                toast.success('Schedule updated successfully')
                setIsEdit(false)
                getSchedule()
            } else {
                toast.error(data.message)
            }
        } catch (error) {

            toast.error(error.response?.data?.message || error.message || 'Failed to update schedule')
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getSchedule()
    }, [getSchedule])

    if (!scheduleData) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
        )
    }

    const convertTo12H = (time24 = "09:00") => {
        let [h, m] = time24.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const hStr = h < 10 ? `0${h}` : `${h}`;
        const mStr = m < 10 ? `0${m}` : `${m}`;
        return { h: hStr, m: mStr, p: suffix };
    };

    const convertTo24H = (h12, m, p) => {
        let h = parseInt(h12);
        if (p === 'PM' && h < 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        const hStr = h < 10 ? `0${h}` : `${h}`;
        return `${hStr}:${m}`;
    };

    const handleTimeChange = (type, unit, val) => {
        const currentTime = scheduleData[type] || "09:00";
        if (is24Hour) {
            const [h, m] = currentTime.split(':');
            const newTime = unit === 'h' ? `${val}:${m}` : `${h}:${val}`;
            setScheduleData(prev => ({ ...prev, [type]: newTime }));
        } else {
            const { h, m, p } = convertTo12H(currentTime);
            const new24H = convertTo24H(
                unit === 'h' ? val : h,
                unit === 'm' ? val : m,
                unit === 'p' ? val : p
            );
            setScheduleData(prev => ({ ...prev, [type]: new24H }));
        }
    };

    const renderTimeDisplay = (time24) => {
        if (!time24) return '--:--';
        if (is24Hour) return time24;
        const { h, m, p } = convertTo12H(time24);
        return `${h}:${m} ${p}`;
    };

    return (
        <div className='m-4 md:m-5 max-w-4xl mx-auto'>
            {/* Header Section - More Compact */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-black text-gray-900 font-poppins tracking-tight'>Availability</h1>
                    <div className='flex items-center gap-3 mt-1'>
                        <div className='flex items-center bg-gray-100 p-0.5 rounded-lg'>
                            <button onClick={() => setIs24Hour(true)} className={`px-2 py-0.5 text-[8px] font-black rounded ${is24Hour ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>24H</button>
                            <button onClick={() => setIs24Hour(false)} className={`px-2 py-0.5 text-[8px] font-black rounded ${!is24Hour ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>12H</button>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {isEdit ? (
                        <div className='flex gap-2'>
                            <button onClick={() => setIsEdit(false)} disabled={loading} className='px-4 py-1.5 border border-gray-200 text-gray-500 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-gray-50 disabled:opacity-50'>Cancel</button>
                            <button onClick={updateSchedule} disabled={loading} className='px-5 py-1.5 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-wider shadow-sm hover:bg-primary-dark active:scale-95 disabled:bg-gray-400'>{loading ? 'Saving...' : 'Save'}</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEdit(true)} className='px-5 py-1.5 bg-white border border-primary text-primary rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-sm'>Edit Settings</button>
                    )}
                </div>
            </div>

            <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Days Grid - Hyper Compact */}
                <div className='p-5 border-b border-gray-50'>
                    <h2 className='text-[8px] font-black text-gray-400 uppercase tracking-widest mb-4'>Operational Days</h2>
                    <div className='grid grid-cols-4 sm:grid-cols-7 gap-2'>
                        {daysOfWeek.map(day => {
                            const isActive = (scheduleData.workingDays || []).includes(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => toggleWorkingDay(day)}
                                    disabled={!isEdit}
                                    className={`py-2 rounded-xl border-2 text-center transition-all ${isActive
                                        ? 'border-primary bg-primary text-white shadow-sm'
                                        : 'border-gray-50 bg-gray-50/20 text-gray-400 opacity-60'
                                        }`}
                                >
                                    <span className='font-black text-[9px] uppercase tracking-tighter'>{day.slice(0, 3)}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Grid - Smaller Cards */}
                <div className='p-5 bg-gray-50/30'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/* Start Card */}
                        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm'>
                            <h3 className='text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 italic'>Clinic Open</h3>
                            {isEdit ? (
                                <div className='flex items-center gap-2'>
                                    <WheelPicker
                                        label="HR"
                                        value={is24Hour ? scheduleData.startTime.split(':')[0] : convertTo12H(scheduleData.startTime).h}
                                        options={is24Hour ? hours24 : hours12}
                                        onChange={(v) => handleTimeChange('startTime', 'h', v)}
                                    />
                                    <div className='text-lg font-black text-gray-200'>:</div>
                                    <WheelPicker
                                        label="MIN"
                                        value={scheduleData.startTime.split(':')[1]}
                                        options={minutes}
                                        onChange={(v) => handleTimeChange('startTime', 'm', v)}
                                    />
                                    {!is24Hour && (
                                        <WheelPicker
                                            label="MOD"
                                            value={convertTo12H(scheduleData.startTime).p}
                                            options={ampm}
                                            onChange={(v) => handleTimeChange('startTime', 'p', v)}
                                        />
                                    )}
                                </div>
                            ) : (
                                <p className='text-3xl font-black text-gray-900 font-poppins tracking-tighter'>{renderTimeDisplay(scheduleData.startTime)}</p>
                            )}
                        </div>

                        {/* End Card */}
                        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm'>
                            <h3 className='text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 italic'>Clinic Close</h3>
                            {isEdit ? (
                                <div className='flex items-center gap-2'>
                                    <WheelPicker
                                        label="HR"
                                        value={is24Hour ? scheduleData.endTime.split(':')[0] : convertTo12H(scheduleData.endTime).h}
                                        options={is24Hour ? hours24 : hours12}
                                        onChange={(v) => handleTimeChange('endTime', 'h', v)}
                                    />
                                    <div className='text-lg font-black text-gray-200'>:</div>
                                    <WheelPicker
                                        label="MIN"
                                        value={scheduleData.endTime.split(':')[1]}
                                        options={minutes}
                                        onChange={(v) => handleTimeChange('endTime', 'm', v)}
                                    />
                                    {!is24Hour && (
                                        <WheelPicker
                                            label="MOD"
                                            value={convertTo12H(scheduleData.endTime).p}
                                            options={ampm}
                                            onChange={(v) => handleTimeChange('endTime', 'p', v)}
                                        />
                                    )}
                                </div>
                            ) : (
                                <p className='text-3xl font-black text-gray-900 font-poppins tracking-tighter'>{renderTimeDisplay(scheduleData.endTime)}</p>
                            )}
                        </div>
                    </div>

                    {/* Slot Control - Compact */}
                    <div className='mt-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between'>
                        <div>
                            <h4 className='text-[8px] font-black text-gray-400 uppercase tracking-widest'>Slot Timing</h4>
                            <p className='text-lg font-black text-gray-900 font-poppins'>{scheduleData.slotDuration} min</p>
                        </div>
                        {isEdit && (
                            <div className='flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100'>
                                <WheelPicker
                                    label="DUR (MIN)"
                                    value={scheduleData.slotDuration}
                                    options={durations}
                                    onChange={(v) => setScheduleData(prev => ({ ...prev, slotDuration: parseInt(v) }))}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Simple Footer */}
                <div className='p-4 px-6 bg-white flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest'>
                    <span>Operational Continuity</span>
                    <span className='text-primary'>Sync Status: Active</span>
                </div>
            </div>
        </div>
    )
}

export default DoctorSchedule
