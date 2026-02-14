import React, { useState, useContext, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

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
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const currentMetricConfig = metricsConfig[selectedMetric]
    const latestForType = latestMetrics[selectedMetric] || (demoData[selectedMetric] ? demoData[selectedMetric][demoData[selectedMetric].length - 1] : null)

    return (
        <div className='min-h-screen py-8'>
            {/* Demo Data Notice */}
            {/* Demo Data Notice removed */}
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-4xl font-bold medical-heading mb-2'>Health Metrics</h1>
                <p className='text-gray-600'>Track your vital signs and monitor your health progress</p>
            </div>

            {/* Quick Overview Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
                {Object.keys(metricsConfig).map((key) => {
                    const config = metricsConfig[key]
                    const latest = latestMetrics[key]
                    const isSelected = selectedMetric === key
                    return (
                        <button
                            key={key}
                            onClick={() => setSelectedMetric(key)}
                            className={`glass-card p-4 transition-all ${isSelected
                                ? 'ring-2 ring-primary shadow-lg scale-105'
                                : 'hover:shadow-md'
                                }`}
                        >
                            <div className='text-4xl mb-2'>{config.icon}</div>
                            <p className='font-semibold text-sm mb-1'>{config.name}</p>
                            <p className='text-xs text-gray-600'>
                                {latest
                                    ? (latest.value !== undefined ? `${latest.value} ${config.unit}` : `${latest.systolic}/${latest.diastolic} ${config.unit}`)
                                    : 'No data'}
                            </p>
                        </button>
                    )
                })}
            </div>

            {/* Detailed View */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
                {/* Latest Reading */}
                <div className='glass-card p-6'>
                    <h3 className='text-lg font-bold mb-4'>Latest Reading</h3>
                    {latestForType ? (
                        <div className='text-center'>
                            <div className='text-6xl mb-4'>{currentMetricConfig.icon}</div>
                            <h4 className='text-xl font-bold mb-2'>{currentMetricConfig.name}</h4>
                            <div className='text-4xl font-bold text-primary mb-2'>
                                {latestForType.value !== undefined
                                    ? `${latestForType.value}`
                                    : `${latestForType.systolic}/${latestForType.diastolic}`}
                            </div>
                            <p className='text-gray-600 mb-4'>{currentMetricConfig.unit}</p>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(latestForType.status)}`}>
                                {(latestForType.status || 'NORMAL').toUpperCase()}
                            </span>
                            <p className='text-sm text-gray-500 mt-4'>
                                Last updated: {new Date(latestForType.recordedAt || latestForType.date).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <div className='text-center py-12'>
                            <p className='text-gray-500'>No readings recorded yet</p>
                        </div>
                    )}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className='w-full mt-6 btn-primary py-3'
                    >
                        Log New Reading
                    </button>
                </div>

                {/* Chart Placeholder */}
                <div className='lg:col-span-2 glass-card p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <h3 className='text-lg font-bold'>Trend (Last {timeRange})</h3>
                        <div className='flex gap-2'>
                            {['7D', '30D', '90D'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${timeRange === range ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className='h-64 flex items-end justify-between gap-2 overflow-x-auto pb-2'>
                        {loading ? (
                            <div className='w-full flex justify-center items-center h-full'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                            </div>
                        ) : metricRecords.length === 0 ? (
                            <div className='w-full flex justify-center items-center h-full text-gray-400'>
                                No history found for this range
                            </div>
                        ) : (
                            metricRecords.map((reading, index) => {
                                const value = reading.value !== undefined ? reading.value : reading.systolic
                                const maxValue = Math.max(...metricRecords.map(r =>
                                    r.value !== undefined ? r.value : r.systolic
                                ), 1)
                                const height = (value / maxValue) * 100

                                return (
                                    <div key={index} className='flex-1 min-w-[40px] flex flex-col items-center'>
                                        <div
                                            className='w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:opacity-80 cursor-pointer'
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                            title={`${value} ${currentMetricConfig.unit} on ${new Date(reading.recordedAt).toLocaleDateString()}`}
                                        />
                                        <p className='text-[10px] text-gray-600 mt-2 truncate w-full text-center'>
                                            {new Date(reading.recordedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className='glass-card p-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-lg font-bold'>Recent Readings</h3>
                    <button
                        onClick={handleExportData}
                        className='px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2'
                    >
                        <span>📥</span> Export Data
                    </button>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead>
                            <tr className='border-b'>
                                <th className='text-left py-3 px-4 font-semibold'>Date</th>
                                <th className='text-left py-3 px-4 font-semibold'>Reading</th>
                                <th className='text-left py-3 px-4 font-semibold'>Status</th>
                                <th className='text-left py-3 px-4 font-semibold'>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metricRecords.length === 0 ? (
                                <tr><td colSpan='4' className='py-8 text-center text-gray-500'>No history recorded</td></tr>
                            ) : (
                                metricRecords.map((reading, index) => (
                                    <tr key={index} className='border-b hover:bg-gray-50'>
                                        <td className='py-4 px-4'>
                                            {new Date(reading.recordedAt).toLocaleDateString()}
                                        </td>
                                        <td className='py-4 px-4 font-semibold'>
                                            {reading.value !== undefined
                                                ? `${reading.value} ${currentMetricConfig.unit}`
                                                : `${reading.systolic}/${reading.diastolic} ${currentMetricConfig.unit}`}
                                        </td>
                                        <td className='py-4 px-4'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reading.status)}`}>
                                                {(reading.status || 'NORMAL').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className='py-4 px-4 text-gray-600'>
                                            {reading.notes || 'Manual entry'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log New Reading Modal */}
            {showAddModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-8 max-w-md w-full'>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-2xl font-bold'>Log {currentMetricConfig.name}</h2>
                            <button onClick={() => setShowAddModal(false)} className='text-gray-400 hover:text-gray-600'>
                                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleLogReading} className='space-y-4'>
                            {selectedMetric === 'blood_pressure' ? (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Systolic *</label>
                                        <input required type='number' value={formData.systolic} onChange={(e) => setFormData(prev => ({ ...prev, systolic: e.target.value }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='120' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-semibold mb-1'>Diastolic *</label>
                                        <input required type='number' value={formData.diastolic} onChange={(e) => setFormData(prev => ({ ...prev, diastolic: e.target.value }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='80' />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className='block text-sm font-semibold mb-1'>Reading ({currentMetricConfig.unit}) *</label>
                                    <input required type='number' step='0.1' value={formData.value} onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='Enter value' />
                                </div>
                            )}
                            <div>
                                <label className='block text-sm font-semibold mb-1'>Date</label>
                                <input type='date' value={formData.recordedAt} onChange={(e) => setFormData(prev => ({ ...prev, recordedAt: e.target.value }))} className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' />
                            </div>
                            <div>
                                <label className='block text-sm font-semibold mb-1'>Notes</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows='2' className='w-full p-3 bg-gray-50 border border-gray-200 rounded-xl' placeholder='Any notes...'></textarea>
                            </div>
                            <div className='flex gap-4 pt-4'>
                                <button type='button' onClick={() => setShowAddModal(false)} className='flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl'>Cancel</button>
                                <button type='submit' className='flex-1 px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl shadow-lg'>Save Reading</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Health Recommendations */}
            <div className='mt-8 glass-card p-6 bg-gradient-to-r from-blue-50 to-purple-50'>
                <div className='flex items-start gap-4'>
                    <div className='text-4xl'>💡</div>
                    <div>
                        <h3 className='text-lg font-bold mb-2'>Health Recommendations</h3>
                        <ul className='space-y-2 text-gray-700'>
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
            </div>
        </div>
    )
}

export default HealthMetrics
