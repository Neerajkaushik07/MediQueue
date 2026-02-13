import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorFinances = () => {
    const { backendUrl, token, currencySymbol } = useContext(AppContext)
    const [financialData, setFinancialData] = useState(null)
    const [loading, setLoading] = useState(true)

    const getFinancialStats = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/doctor/financial-stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setFinancialData(data)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            
            toast.error('Failed to load financial data')
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token])

    useEffect(() => {
        if (token) {
            getFinancialStats()
        }
    }, [token, getFinancialStats])

    const statsOverview = useMemo(() => {
        const totalRevenue = financialData?.chartData?.reduce((acc, d) => acc + d.amount, 0) || 0
        const avgMonthly = financialData?.chartData?.length > 0 ? (totalRevenue / financialData.chartData.length).toFixed(0) : 0
        const lastMonth = financialData?.chartData?.[financialData.chartData.length - 1]?.amount || 0
        const previousMonth = financialData?.chartData?.[financialData.chartData.length - 2]?.amount || 1 // Avoid div by zero
        const growth = (((lastMonth - previousMonth) / previousMonth) * 100).toFixed(1)

        return { totalRevenue, avgMonthly, lastMonth, growth }
    }, [financialData])

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[80vh]'>
                <div className='relative'>
                    <div className='w-20 h-20 border-4 border-primary/20 rounded-full'></div>
                    <div className='w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0'></div>
                </div>
            </div>
        )
    }

    const maxChartAmount = Math.max(...(financialData?.chartData.map(d => d.amount) || [100])) || 100

    return (
        <div className='flex flex-col gap-8 m-5 max-w-7xl animate-fade-in-up font-outfit'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
                <div>
                    <h1 className='text-4xl font-black text-gray-900 tracking-tight'>Financial Dashboard</h1>
                    <p className='text-gray-500 mt-2 text-lg'>Monitor your professional revenue, settlements, and growth analytics.</p>
                </div>
                <div className='flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-soft border border-gray-100'>
                    <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                    <span className='text-sm font-black text-gray-500 uppercase tracking-widest'>Live Revenue Stream</span>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='bg-white p-6 rounded-[2rem] shadow-card border border-gray-50 group hover:-translate-y-2 transition-all duration-500'>
                    <div className='flex justify-between items-start mb-6'>
                        <div className='w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center'>
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                        </div>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${statsOverview.growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {statsOverview.growth >= 0 ? '+' : ''}{statsOverview.growth}%
                        </span>
                    </div>
                    <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Gross Revenue</p>
                    <h3 className='text-3xl font-black text-gray-900 mt-1'>{currencySymbol}{statsOverview.totalRevenue.toLocaleString()}</h3>
                </div>

                <div className='bg-white p-6 rounded-[2rem] shadow-card border border-gray-50 group hover:-translate-y-2 transition-all duration-500'>
                    <div className='w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' /></svg>
                    </div>
                    <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Monthly Average</p>
                    <h3 className='text-3xl font-black text-gray-900 mt-1'>{currencySymbol}{statsOverview.avgMonthly.toLocaleString()}</h3>
                </div>

                <div className='bg-white p-6 rounded-[2rem] shadow-card border border-gray-50 group hover:-translate-y-2 transition-all duration-500'>
                    <div className='w-12 h-12 bg-trust-blue/10 text-trust-blue rounded-2xl flex items-center justify-center mb-6'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' /></svg>
                    </div>
                    <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Active Patients</p>
                    <h3 className='text-3xl font-black text-gray-900 mt-1'>0</h3>
                </div>

                <div className='bg-white p-6 rounded-[2rem] shadow-card border border-gray-50 group hover:-translate-y-2 transition-all duration-500'>
                    <div className='w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-6'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
                    </div>
                    <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Pending Claims</p>
                    <h3 className='text-3xl font-black text-gray-900 mt-1'>0.00</h3>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Advanced Chart Section */}
                <div className='lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-medical border border-gray-100 relative overflow-hidden'>
                    <div className='absolute top-0 right-0 p-8'>
                        <button onClick={getFinancialStats} className='p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-primary'>
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' /></svg>
                        </button>
                    </div>

                    <div className='flex items-center gap-4 mb-12'>
                        <div className='w-2 h-10 bg-primary rounded-full'></div>
                        <h2 className='text-2xl font-black text-gray-900 tracking-tight'>Revenue Growth</h2>
                    </div>

                    <div className='flex items-end justify-between h-[300px] gap-4 mb-4 relative'>
                        {/* Custom Chart Grids */}
                        <div className='absolute inset-0 flex flex-col justify-between pointer-events-none'>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className='w-full border-t border-gray-50'></div>
                            ))}
                        </div>

                        {financialData?.chartData.map((item, index) => (
                            <div key={index} className='flex-1 flex flex-col items-center gap-4 group relative z-10'>
                                <div className='relative w-full flex justify-center items-end h-full'>
                                    <div
                                        className='w-full max-w-[60px] bg-gradient-primary rounded-2xl transition-all duration-700 group-hover:scale-x-110 group-hover:shadow-[0_0_20px_rgba(8,145,178,0.3)] relative group'
                                        style={{ height: `${(item.amount / maxChartAmount) * 100}%` }}
                                    >
                                        <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl border border-white/10 scale-90 group-hover:scale-100'>
                                            {currencySymbol}{item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <span className='text-[10px] font-black text-gray-400 group-hover:text-primary tracking-widest uppercase transition-colors cursor-default'>{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Balance & Breakdown Section */}
                <div className='flex flex-col gap-8'>
                    {/* Premium Balance Card */}
                    <div className='bg-gradient-primary p-1 rounded-[3rem] shadow-medical group cursor-default transition-all hover:scale-[1.02]'>
                        <div className='bg-white rounded-[2.8rem] p-10 h-full relative overflow-hidden'>
                            {/* Decorative Blur */}
                            <div className='absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl'></div>

                            <div className='relative z-10'>
                                <div className='flex items-center justify-between mb-8'>
                                    <p className='text-xs font-black text-gray-400 uppercase tracking-[0.2em]'>Current Balance</p>
                                    <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' /></svg>
                                    </div>
                                </div>
                                <h3 className='text-5xl font-black text-gray-900 mb-10 tracking-tighter'>{currencySymbol}0.00</h3>
                                <button className='w-full py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl active:scale-95 uppercase text-xs tracking-widest'>
                                    Withdraw Funds
                                </button>
                                <p className='text-[10px] text-gray-400 font-bold mt-6 text-center italic'>Next settlement available in 2 days</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Card */}
                    <div className='bg-white p-10 rounded-[3rem] shadow-card border border-gray-100'>
                        <h4 className='text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3'>
                            <div className='w-1.5 h-6 bg-secondary rounded-full'></div>
                            Earning Breakdown
                        </h4>
                        <div className='space-y-6'>
                            <div className='space-y-3'>
                                <div className='flex justify-between items-end'>
                                    <span className='text-sm font-black text-gray-700'>Consultations</span>
                                    <span className='text-sm font-black text-emerald-600'>{currencySymbol}0</span>
                                </div>
                                <div className='w-full h-2 bg-gray-50 rounded-full overflow-hidden'>
                                    <div className='h-full bg-emerald-500 rounded-full' style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className='space-y-3'>
                                <div className='flex justify-between items-end'>
                                    <span className='text-sm font-black text-gray-700'>Procedures</span>
                                    <span className='text-sm font-black text-blue-600'>{currencySymbol}0</span>
                                </div>
                                <div className='w-full h-2 bg-gray-50 rounded-full overflow-hidden'>
                                    <div className='h-full bg-blue-500 rounded-full' style={{ width: '0%' }}></div>
                                </div>
                            </div>
                            <div className='space-y-3'>
                                <div className='flex justify-between items-end'>
                                    <span className='text-sm font-black text-gray-700'>Incentives</span>
                                    <span className='text-sm font-black text-purple-600'>{currencySymbol}0</span>
                                </div>
                                <div className='w-full h-2 bg-gray-50 rounded-full overflow-hidden'>
                                    <div className='h-full bg-purple-500 rounded-full' style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payout History Section */}
            <div className='bg-white rounded-[3rem] shadow-card border border-gray-100 overflow-hidden'>
                <div className='p-10 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/30'>
                    <div>
                        <h3 className='text-2xl font-black text-gray-900 tracking-tight'>Settlement History</h3>
                        <p className='text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider'>Track your bank transfers and status</p>
                    </div>
                    <button className='px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm'>
                        Export CSV Report
                    </button>
                </div>

                <div className='overflow-x-auto p-4 sm:p-8 pt-0'>
                    <table className='w-full text-left'>
                        <thead className='text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100'>
                            <tr>
                                <th className='px-8 py-8'>Reference ID</th>
                                <th className='px-8 py-8'>Settlement Date</th>
                                <th className='px-8 py-8'>Account Type</th>
                                <th className='px-8 py-8'>Status</th>
                                <th className='px-8 py-8 text-right'>Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='group'>
                                <td colSpan="5" className='py-32'>
                                    <div className='flex flex-col items-center opacity-40 grayscale'>
                                        <div className='w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mb-8 border-4 border-white shadow-soft'>
                                            <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                                            </svg>
                                        </div>
                                        <h4 className='font-black text-2xl text-gray-800 tracking-tight'>No Active Settlements</h4>
                                        <p className='text-sm font-bold text-gray-400 mt-3 max-w-xs text-center uppercase tracking-wider'>
                                            Your first transaction record will be visible here after a successful withdrawal.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visual Polish Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
            `}} />
        </div>
    )
}

export default DoctorFinances
