import React, { useState, useContext, useEffect, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const LabReports = () => {
    const { backendUrl, token } = useContext(AppContext)
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [activeFilter, setActiveFilter] = useState('all')

    const demoReports = [
        {
            _id: 'demo_lab_1',
            reportNumber: 'LAB1707820000',
            reportType: 'blood_test',
            title: 'Complete Blood Count (CBC)',
            labName: 'Central Diagnostic Lab',
            testDate: '2024-10-10',
            overallStatus: 'normal',
            isDemo: true,
            results: [
                { testName: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.5 - 17.5', status: 'normal' },
                { testName: 'WBC Count', value: '7,200', unit: '/mcL', referenceRange: '4,500 - 11,000', status: 'normal' },
                { testName: 'Platelets', value: '250,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'normal' }
            ]
        },
        {
            _id: 'demo_lab_2',
            reportNumber: 'LAB1707830000',
            reportType: 'lipid_panel',
            title: 'Lipid Profile',
            labName: 'HeartCare Diagnostics',
            testDate: '2024-09-15',
            overallStatus: 'abnormal',
            isDemo: true,
            results: [
                { testName: 'Total Cholesterol', value: '210', unit: 'mg/dL', referenceRange: '< 200', status: 'abnormal' },
                { testName: 'HDL (Good)', value: '45', unit: 'mg/dL', referenceRange: '> 40', status: 'normal' },
                { testName: 'LDL (Bad)', value: '140', unit: 'mg/dL', referenceRange: '< 100', status: 'abnormal' }
            ]
        }
    ]

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${backendUrl}/api/health/lab-reports`, { headers: { token } })
            if (data.success) {
                // Merge demo data with real data if needed, or just use real data
                setReports(data.reports.length > 0 ? data.reports : demoReports)
            } else {
                setReports(demoReports)
            }
        } catch (error) {
            console.error('Error fetching lab reports:', error)
            setReports(demoReports)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token])

    useEffect(() => {
        if (token) {
            fetchReports()
        } else {
            setReports(demoReports)
            setLoading(false)
        }
    }, [token, fetchReports])

    const filteredReports = activeFilter === 'all'
        ? reports
        : reports.filter(r => r.reportType === activeFilter)

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'normal': return 'bg-green-100 text-green-700'
            case 'abnormal': return 'bg-orange-100 text-orange-700'
            case 'critical': return 'bg-red-100 text-red-700'
            case 'pending': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const reportTypes = [
        { value: 'all', label: 'All Reports', icon: '🔬' },
        { value: 'blood_test', label: 'Blood Tests', icon: '🩸' },
        { value: 'urine_test', label: 'Urine Analysis', icon: '🧪' },
        { value: 'xray', label: 'X-Ray / Imaging', icon: '🦴' },
        { value: 'ecg', label: 'ECG / Heart', icon: '❤️' },
        { value: 'other', label: 'Others', icon: '📋' }
    ]

    const handleDownloadPDF = (report) => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(40, 44, 52);
            doc.text('MediQueue Lab Report', 105, 20, { align: 'center' });

            doc.setDrawColor(0, 116, 217);
            doc.line(20, 25, 190, 25);

            // Patient & Report Info
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Title: ${report.title}`, 20, 40);
            doc.setFont('helvetica', 'normal');
            doc.text(`Report #: ${report.reportNumber}`, 20, 47);
            doc.text(`Lab: ${report.labName}`, 20, 54);
            doc.text(`Date: ${new Date(report.testDate).toLocaleDateString()}`, 20, 61);
            doc.text(`Status: ${report.overallStatus.toUpperCase()}`, 140, 40);

            // Summary
            if (report.description) {
                doc.setFont('helvetica', 'italic');
                doc.text(`Description: ${report.description}`, 20, 75);
            }

            // Table
            const tableColumn = ["Test Name", "Result", "Unit", "Ref. Range", "Status"];
            const tableRows = (report.results || []).map(res => [
                res.testName || 'N/A',
                res.value || '-',
                res.unit || '-',
                res.referenceRange || '-',
                (res.status || 'normal').toUpperCase()
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 85,
                theme: 'striped',
                headStyles: { fillColor: [0, 116, 217] },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { top: 30 }
            });

            // Footer/Notes
            const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 85) + 15;
            if (report.doctorNotes) {
                doc.setFont('helvetica', 'bold');
                doc.text("Doctor's Notes:", 20, finalY);
                doc.setFont('helvetica', 'normal');
                doc.text(report.doctorNotes, 20, finalY + 7, { maxWidth: 170 });
            }

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Generated by MediQueue on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

            doc.save(`LabReport_${report.reportNumber}.pdf`);
            toast.success('PDF generated successfully!');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <div className='min-h-screen py-8 mb-20'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-4xl font-bold medical-heading mb-2'>Lab Reports</h1>
                <p className='text-gray-600'>View and track your laboratory test results over time</p>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-3 mb-8'>
                {reportTypes.map(type => (
                    <button
                        key={type.value}
                        onClick={() => setActiveFilter(type.value)}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${activeFilter === type.value
                            ? 'bg-primary text-white shadow-glow'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        <span>{type.icon}</span>
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Reports Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {loading ? (
                    <div className='col-span-full flex justify-center py-20'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className='col-span-full glass-card p-12 text-center'>
                        <div className='text-6xl mb-4'>🔬</div>
                        <h3 className='text-xl font-bold mb-2'>No Reports Found</h3>
                        <p className='text-gray-600'>No results matching your current filter.</p>
                    </div>
                ) : (
                    filteredReports.map(report => (
                        <div
                            key={report._id}
                            onClick={() => { setSelectedReport(report); setShowModal(true) }}
                            className='glass-card p-6 cursor-pointer hover:shadow-xl transition-all group'
                        >
                            <div className='flex justify-between items-start mb-4'>
                                <div className='w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl text-white'>
                                    {reportTypes.find(t => t.value === report.reportType)?.icon || '🔬'}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyles(report.overallStatus)}`}>
                                    {report.overallStatus}
                                </span>
                            </div>
                            <h3 className='text-xl font-bold mb-1 group-hover:text-primary transition-colors'>{report.title}</h3>
                            <p className='text-sm text-gray-500 mb-4'>{report.labName}</p>

                            <div className='flex items-center justify-between text-sm pt-4 border-t border-gray-50'>
                                <span className='text-gray-400'>
                                    {new Date(report.testDate).toLocaleDateString()}
                                </span>
                                <span className='text-primary font-bold group-hover:translate-x-1 transition-transform'>
                                    View Details →
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Report Details Modal */}
            {showModal && selectedReport && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in'>
                        <div className='flex justify-between items-start mb-8'>
                            <div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-3 inline-block ${getStatusStyles(selectedReport.overallStatus)}`}>
                                    {selectedReport.overallStatus} REPORT
                                </span>
                                <h1 className='text-3xl font-bold text-gray-900'>{selectedReport.title}</h1>
                                <p className='text-gray-500 mt-1'>{selectedReport.labName} • {new Date(selectedReport.testDate).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                                <svg className='w-6 h-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <div className='space-y-6'>
                            {/* Summary Section */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Report Number</p>
                                    <p className='font-mono font-bold text-gray-800'>{selectedReport.reportNumber}</p>
                                </div>
                                <div className='p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Test Date</p>
                                    <p className='font-bold text-gray-800'>{new Date(selectedReport.testDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Detailed Results Table */}
                            <div>
                                <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
                                    <span>📊</span> Detailed Observations
                                </h3>
                                <div className='overflow-hidden rounded-2xl border border-gray-100'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                                                <th className='px-6 py-4'>Test Name</th>
                                                <th className='px-6 py-4 text-center'>Result</th>
                                                <th className='px-6 py-4'>Reference Range</th>
                                                <th className='px-6 py-4'>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-100'>
                                            {selectedReport.results?.map((res, idx) => (
                                                <tr key={idx} className='hover:bg-gray-50 transition-colors'>
                                                    <td className='px-6 py-4 font-semibold text-gray-800'>{res.testName}</td>
                                                    <td className='px-6 py-4 text-center'>
                                                        <span className='font-bold text-primary'>{res.value}</span>
                                                        <span className='text-xs text-gray-400 ml-1'>{res.unit}</span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-500'>{res.referenceRange}</td>
                                                    <td className='px-6 py-4'>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusStyles(res.status)}`}>
                                                            {res.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Doctor Notes */}
                            {selectedReport.doctorNotes && (
                                <div className='p-6 bg-blue-50/50 rounded-2xl border border-blue-100'>
                                    <h4 className='font-bold text-blue-900 mb-2 flex items-center gap-2'>
                                        <span>💬</span> Doctor's Notes
                                    </h4>
                                    <p className='text-blue-800 text-sm italic leading-relaxed'>
                                        "{selectedReport.doctorNotes}"
                                    </p>
                                </div>
                            )}

                            {/* Attachments */}
                            {selectedReport.files && selectedReport.files.length > 0 && (
                                <div>
                                    <h4 className='font-bold mb-4'>Attachments</h4>
                                    <div className='flex flex-wrap gap-3'>
                                        {selectedReport.files.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all group'
                                            >
                                                <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                                </svg>
                                                <span className='text-sm font-medium text-gray-700 max-w-[150px] truncate'>{file.name}</span>
                                                <svg className='w-4 h-4 text-gray-400 group-hover:text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='mt-10 flex gap-4'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all'
                            >
                                Close View
                            </button>
                            <button
                                onClick={() => handleDownloadPDF(selectedReport)}
                                className='flex-1 py-4 bg-gradient-primary text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all'
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LabReports
