import React, { useState, useContext, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const HealthMetrics = () => {
    const { backendUrl, token, isDemoMode } = useContext(AppContext)
    const [selectedMetric, setSelectedMetric] = useState('blood_pressure')
    const [timeRange, setRange] = useState('7D')
    const [showAddModal, setShowAddModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [metricRecords, setMetricRecords] = useState([])
    const [latestMetrics, setLatestMetrics] = useState({})

    const [formData, setFormData] = useState({
        value: '',
        systolic: '',
        diastolic: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
    })

    const metricsConfig = {
        blood_pressure: { name: 'Blood Pressure', icon: '❤️', unit: 'mmHg' },
        heart_rate: { name: 'Heart Rate', icon: '💓', unit: 'bpm' },
        weight: { name: 'Weight', icon: '⚖️', unit: 'kg' },
        blood_sugar: { name: 'Blood Sugar', icon: '🩸', unit: 'mg/dL' },
        temperature: { name: 'Temperature', icon: '🌡️', unit: '°C' },
        oxygen_saturation: { name: 'Oxygen Level', icon: '🌬️', unit: '%' }
    }

    const validationRanges = {
        blood_pressure: { systolic: { min: 60, max: 250 }, diastolic: { min: 40, max: 150 } },
        heart_rate: { min: 30, max: 220 },
        weight: { min: 20, max: 400 },
        blood_sugar: { min: 40, max: 600 },
        temperature: { min: 30, max: 45 },
        oxygen_saturation: { min: 50, max: 100 }
    }

    const demoData = {
        blood_pressure: [
            { systolic: 118, diastolic: 78, recordedAt: '2024-10-20', status: 'normal' },
            { systolic: 122, diastolic: 82, recordedAt: '2024-10-22', status: 'normal' },
            { systolic: 120, diastolic: 80, recordedAt: '2024-10-24', status: 'normal' }
        ],
        heart_rate: [
            { value: 70, recordedAt: '2024-10-20', status: 'normal' },
            { value: 75, recordedAt: '2024-10-22', status: 'normal' },
            { value: 72, recordedAt: '2024-10-24', status: 'normal' }
        ]
        // Add others as needed
    }

    const fetchLatestMetrics = useCallback(async () => {
        if (isDemoMode) return
        try {
            const { data } = await axios.get(backendUrl + '/api/health/metrics/latest', { headers: { token } })
            if (data.success) {
                setLatestMetrics(data.metrics)
            }
        } catch (error) {
            console.error('Error fetching latest metrics:', error)
        }
    }, [backendUrl, token, isDemoMode])

    const fetchHistory = useCallback(async () => {
        if (isDemoMode) {
            setLoading(true)
            setTimeout(() => {
                setMetricRecords(demoData[selectedMetric] || [])
                setLoading(false)
            }, 500)
            return
        }

        try {
            setLoading(true)
            const daysMap = { '7D': 7, '30D': 30, '90D': 90 }
            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(endDate.getDate() - daysMap[timeRange])

            const { data } = await axios.get(`${backendUrl}/api/health/metrics?metricType=${selectedMetric}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers: { token } })

            if (data.success) {
                // Merge with demo data for visualization if no real data
                const realData = data.metrics.map(m => ({ ...m, recordedAt: m.recordedAt.split('T')[0] }))
                if (realData.length === 0) {
                    setMetricRecords(demoData[selectedMetric] || [])
                } else {
                    setMetricRecords(realData)
                }
            }
        } catch (error) {
            console.error('Error fetching history:', error)
            setMetricRecords(demoData[selectedMetric] || [])
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, selectedMetric, timeRange, isDemoMode])

    useEffect(() => {
        if (token) {
            fetchLatestMetrics()
            fetchHistory()
        }
    }, [token, fetchLatestMetrics, fetchHistory])

    const handleLogReading = async (e) => {
        e.preventDefault()

        // Form Validation
        const limits = validationRanges[selectedMetric];
        if (selectedMetric === 'blood_pressure') {
            const sys = Number(formData.systolic);
            const dia = Number(formData.diastolic);
            if (sys < limits.systolic.min || sys > limits.systolic.max || dia < limits.diastolic.min || dia > limits.diastolic.max) {
                toast.error(`Invalid BP. Systolic must be ${limits.systolic.min}-${limits.systolic.max}, Diastolic must be ${limits.diastolic.min}-${limits.diastolic.max}`);
                return;
            }
        } else {
            const val = Number(formData.value);
            if (val < limits.min || val > limits.max) {
                toast.error(`Invalid value. Please enter a value between ${limits.min} and ${limits.max}`);
                return;
            }
        }

        if (isDemoMode) {
            toast.info('Changes cannot be saved in Demo Mode')
            setShowAddModal(false)
            return
        }
        try {
            const dataToSubmit = {
                ...formData,
                metricType: selectedMetric,
                unit: metricsConfig[selectedMetric].unit
            }
            const { data } = await axios.post(backendUrl + '/api/health/metrics/add', dataToSubmit, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                setShowAddModal(false)
                setFormData({ value: '', systolic: '', diastolic: '', notes: '', recordedAt: new Date().toISOString().split('T')[0] })
                fetchLatestMetrics()
                fetchHistory()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDeleteRecord = async (id) => {
        if (!window.confirm("Are you sure you want to delete this reading?")) return;

        if (isDemoMode) {
            setMetricRecords(prev => prev.filter(r => r._id !== id && r.systolic !== id && r.value !== id));
            toast.success("Demo record removed");
            return;
        }

        try {
            const { data } = await axios.delete(`${backendUrl}/api/health/metrics/${id}`, { headers: { token } });
            if (data.success) {
                toast.success('Reading deleted');
                fetchHistory();
                fetchLatestMetrics();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleExportData = () => {
        if (metricRecords.length === 0) {
            toast.error('No data found to export')
            return
        }

        const headers = selectedMetric === 'blood_pressure'
            ? ['Date', 'Systolic', 'Diastolic', 'Unit', 'Status', 'Notes']
            : ['Date', 'Value', 'Unit', 'Status', 'Notes']

        const rows = metricRecords.map(record => {
            const date = new Date(record.recordedAt).toLocaleDateString()
            const status = (record.status || 'normal').toUpperCase()
            const notes = record.notes ? record.notes.replace(/,/g, ';') : 'Manual entry'
            const unit = record.unit || metricsConfig[selectedMetric].unit

            if (selectedMetric === 'blood_pressure') {
                return [date, record.systolic, record.diastolic, unit, status, notes]
            } else {
                return [date, record.value, unit, status, notes]
            }
        })

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${selectedMetric}_report_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success(`${metricsConfig[selectedMetric].name} data exported!`)
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'normal': return 'text-green-600 bg-green-100'
            case 'low': return 'text-yellow-600 bg-yellow-100'
            case 'high': return 'text-orange-600 bg-orange-100'
            case 'critical': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'
        }
    }

    const getRecommendationTone = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'critical':
                return {
                    title: 'Immediate Attention Recommended',
                    summary: 'Your recent readings suggest high risk. Contact your doctor as soon as possible.',
                    accent: 'from-red-50 to-rose-50 border-red-200'
                }
            case 'high':
            case 'low':
                return {
                    title: 'Keep Monitoring Closely',
                    summary: 'Some readings are outside the ideal range. Continue tracking and consult your provider if this continues.',
                    accent: 'from-amber-50 to-orange-50 border-amber-200'
                }
            default:
                return {
                    title: 'Stable Progress',
                    summary: 'Your recent trend looks stable. Keep logging consistently for better long-term insights.',
                    accent: 'from-cyan-50 to-emerald-50 border-cyan-200'
                }
        }
    }

    const currentMetricConfig = metricsConfig[selectedMetric]
    const latestForType = latestMetrics[selectedMetric] || (demoData[selectedMetric] ? demoData[selectedMetric][demoData[selectedMetric].length - 1] : null)
    const recommendationTone = getRecommendationTone(latestForType?.status)
    const readingsThisRange = metricRecords.length
    const bpAverages = selectedMetric === 'blood_pressure' && metricRecords.length > 0
        ? {
            sys: Math.round(metricRecords.reduce((acc, r) => acc + Number(r.systolic || 0), 0) / metricRecords.length),
            dia: Math.round(metricRecords.reduce((acc, r) => acc + Number(r.diastolic || 0), 0) / metricRecords.length)
        }
        : null

    return (
        <div className='min-h-screen pt-8 pb-20 px-4 md:px-6'>
            <div className='max-w-7xl mx-auto'>
                <section className='relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 md:p-8 mb-8'>
                    <div className='absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl'></div>
                    <div className='absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl'></div>
                    <div className='relative flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between'>
                        <div>
                            <p className='text-xs md:text-sm font-semibold uppercase tracking-wide text-cyan-700 mb-2'>Health Intelligence</p>
                            <h1 className='text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2'>Health Metrics</h1>
                            <p className='text-slate-600 dark:text-slate-300 max-w-xl'>Track trends, log fresh readings, and stay ahead of changes in your vitals.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className='px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all'
                        >
                            Log New Reading
                        </button>
                    </div>
                </section>

                <section className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
                    {Object.keys(metricsConfig).map((key) => {
                        const config = metricsConfig[key]
                        const latest = latestMetrics[key] || (demoData[key] ? demoData[key][demoData[key].length - 1] : null)
                        const isSelected = selectedMetric === key
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedMetric(key)}
                                className={`rounded-2xl border p-4 text-left transition-all ${isSelected
                                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg -translate-y-0.5'
                                    : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:shadow-md hover:border-cyan-200'
                                    }`}
                            >
                                <div className='text-3xl mb-2'>{config.icon}</div>
                                <p className={`font-semibold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{config.name}</p>
                                <p className={`text-xs ${isSelected ? 'text-cyan-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {latest
                                        ? (latest.value !== undefined ? `${latest.value} ${config.unit}` : `${latest.systolic}/${latest.diastolic} ${config.unit}`)
                                        : 'No data'}
                                </p>
                            </button>
                        )
                    })}
                </section>

                <section className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
                    <div className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-none'>
                        <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-4'>Latest Reading</h3>
                        {latestForType ? (
                            <div className='text-center'>
                                <div className='text-6xl mb-4'>{currentMetricConfig.icon}</div>
                                <h4 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>{currentMetricConfig.name}</h4>
                                <div className='text-4xl font-black text-cyan-700 mb-2'>
                                    {latestForType.value !== undefined
                                        ? `${latestForType.value}`
                                        : `${latestForType.systolic}/${latestForType.diastolic}`}
                                </div>
                                <p className='text-slate-600 dark:text-slate-300 mb-4'>{currentMetricConfig.unit}</p>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(latestForType.status)}`}>
                                    {(latestForType.status || 'NORMAL').toUpperCase()}
                                </span>
                                <p className='text-sm text-slate-500 dark:text-slate-400 mt-4'>
                                    Last updated: {new Date(latestForType.recordedAt || latestForType.date).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <div className='text-center py-12'>
                                <p className='text-slate-500 dark:text-slate-400'>No readings recorded yet</p>
                            </div>
                        )}
                        <div className='mt-6 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 p-4 text-left'>
                            <p className='text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-1'>Range Summary</p>
                            <p className='text-sm text-slate-700 dark:text-slate-200'>Readings in selected range: <span className='font-bold'>{readingsThisRange}</span></p>
                            {bpAverages && (
                                <p className='text-sm text-slate-700 dark:text-slate-200 mt-1'>Average BP: <span className='font-bold'>{bpAverages.sys}/{bpAverages.dia}</span></p>
                            )}
                        </div>
                    </div>

                    <div className='lg:col-span-2 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-none'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
                            <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Trend (Last {timeRange})</h3>
                            <div className='flex gap-2'>
                                {['7D', '30D', '90D'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setRange(range)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeRange === range ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='h-[300px] w-full'>
                            {loading ? (
                                <div className='w-full flex justify-center items-center h-full'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600'></div>
                                </div>
                            ) : metricRecords.length === 0 ? (
                                <div className='w-full flex justify-center items-center h-full text-slate-400'>
                                    No history found for this range
                                </div>
                            ) : (
                                <ResponsiveContainer width='100%' height='100%'>
                                    <LineChart
                                        data={[...metricRecords].reverse()}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray='3 3' vertical={false} opacity={0.2} />
                                        <XAxis
                                            dataKey='recordedAt'
                                            tickFormatter={(tick) => new Date(tick).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                            minTickGap={20}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickMargin={10}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 6px 12px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        {selectedMetric === 'blood_pressure' ? (
                                            <>
                                                <Line type='monotone' dataKey='systolic' stroke='#ef4444' strokeWidth={3} name='Systolic' activeDot={{ r: 6 }} />
                                                <Line type='monotone' dataKey='diastolic' stroke='#3b82f6' strokeWidth={3} name='Diastolic' activeDot={{ r: 6 }} />
                                            </>
                                        ) : (
                                            <Line type='monotone' dataKey='value' stroke='#0891b2' strokeWidth={3} name={currentMetricConfig.name} activeDot={{ r: 6 }} />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </section>

                <section className='rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-none'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
                        <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Recent Readings</h3>
                        <button
                            onClick={handleExportData}
                            className='px-4 py-2 bg-slate-100 dark:bg-gray-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-2'
                        >
                            <span>📥</span> Export Data
                        </button>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='border-b border-slate-100'>
                                    <th className='text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200'>Date</th>
                                    <th className='text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200'>Reading</th>
                                    <th className='text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200'>Status</th>
                                    <th className='text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200'>Notes</th>
                                    <th className='text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-200'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metricRecords.length === 0 ? (
                                    <tr><td colSpan='5' className='py-8 text-center text-slate-500 dark:text-slate-400'>No history recorded</td></tr>
                                ) : (
                                    metricRecords.map((reading, index) => (
                                        <tr key={index} className='border-b border-slate-100 hover:bg-slate-50 dark:bg-gray-900/80'>
                                            <td className='py-4 px-4 text-slate-700 dark:text-slate-200'>
                                                {new Date(reading.recordedAt).toLocaleDateString()}
                                            </td>
                                            <td className='py-4 px-4 font-semibold text-slate-900 dark:text-white'>
                                                {reading.value !== undefined
                                                    ? `${reading.value} ${currentMetricConfig.unit}`
                                                    : `${reading.systolic}/${reading.diastolic} ${currentMetricConfig.unit}`}
                                            </td>
                                            <td className='py-4 px-4'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reading.status)}`}>
                                                    {(reading.status || 'NORMAL').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className='py-4 px-4 text-slate-600 dark:text-slate-300'>
                                                {reading.notes || 'Manual entry'}
                                            </td>
                                            <td className='py-4 px-4 text-center'>
                                                <button
                                                    onClick={() => handleDeleteRecord(reading._id || reading.systolic || reading.value)}
                                                    className='p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors'
                                                    title='Delete Record'
                                                >
                                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Log New Reading Modal */}
                {showAddModal && (
                    <div className='fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                        <div className='bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden'>
                            <div className='px-6 py-5 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-emerald-50 flex items-center justify-between'>
                                <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>Log {currentMetricConfig.name}</h2>
                                <button onClick={() => setShowAddModal(false)} className='text-slate-400 hover:text-slate-600 dark:text-slate-300'>
                                    <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>

                            <div className='p-6'>

                                <form onSubmit={handleLogReading} className='space-y-4'>
                                    {selectedMetric === 'blood_pressure' ? (
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div>
                                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Systolic *</label>
                                                <input required type='number' value={formData.systolic} onChange={(e) => setFormData(prev => ({ ...prev, systolic: e.target.value }))} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='120' />
                                            </div>
                                            <div>
                                                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Diastolic *</label>
                                                <input required type='number' value={formData.diastolic} onChange={(e) => setFormData(prev => ({ ...prev, diastolic: e.target.value }))} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='80' />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Reading ({currentMetricConfig.unit}) *</label>
                                            <input required type='number' step='0.1' value={formData.value} onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='Enter value' />
                                        </div>
                                    )}
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Date</label>
                                        <input type='date' value={formData.recordedAt} onChange={(e) => setFormData(prev => ({ ...prev, recordedAt: e.target.value }))} className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1'>Notes</label>
                                        <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows='2' className='w-full p-3 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 outline-none transition-all' placeholder='Any notes...'></textarea>
                                    </div>
                                    <div className='flex gap-4 pt-4'>
                                        <button type='button' onClick={() => setShowAddModal(false)} className='flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-colors'>Cancel</button>
                                        <button type='submit' className='flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all'>Save Reading</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Health Recommendations */}
                <section className={`mt-8 rounded-2xl border p-6 bg-gradient-to-r ${recommendationTone.accent}`}>
                    <div className='flex items-start gap-4'>
                        <div className='text-4xl'>💡</div>
                        <div>
                            <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-1'>{recommendationTone.title}</h3>
                            <p className='text-sm text-slate-600 dark:text-slate-300 mb-3'>{recommendationTone.summary}</p>
                            <ul className='space-y-2 text-slate-700 dark:text-slate-200'>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-600 mt-1'>✓</span>
                                    <span>Your {currentMetricConfig.name.toLowerCase()} is within the normal range. Keep up the good work!</span>
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-blue-600 mt-1'>→</span>
                                    <span>Monitor your readings regularly for best results</span>
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-purple-600 mt-1'>★</span>
                                    <span>Consult your doctor if you notice any unusual patterns</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default HealthMetrics
