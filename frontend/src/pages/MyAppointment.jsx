import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, isDemoMode } = useContext(AppContext)
  const navigate = useNavigate()
  const { doctors } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [payment, setPayment] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'completed', 'cancelled'
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleSlots, setRescheduleSlots] = useState([])
  const [rescheduleSlotIndex, setRescheduleSlotIndex] = useState(0)
  const [rescheduleSlotTime, setRescheduleSlotTime] = useState('')

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month)]} ${year}`
  }

  // Getting User Appointments Data Using API
  const getUserAppointments = useCallback(async () => {
    try {
      if (!token || isDemoMode) {
        setAppointments([
          {
            _id: 'mock1',
            docData: {
              name: 'Dr. Richard James',
              speciality: 'General Physician',
              address: { line1: '123 Medical St', line2: 'Health City' },
              image: assets.doc1
            },
            slotDate: '24_10_2024',
            slotTime: '10:00 AM',
            cancelled: false,
            isCompleted: false,
            payment: false
          },
          {
            _id: 'mock2',
            docData: {
              name: 'Dr. Sarah Smith',
              speciality: 'Gynecologist',
              address: { line1: '456 Care Ave', line2: 'Wellness Town' },
              image: assets.doc2
            },
            slotDate: '25_10_2024',
            slotTime: '11:00 AM',
            cancelled: false,
            isCompleted: true,
            payment: true
          }
        ].reverse())
        return
      }

      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      setAppointments(data.appointments.reverse())

    } catch (error) {
      toast.error(error.message)
    }
  }, [backendUrl, token])

  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    if (isDemoMode) {
      toast.info('Changes cannot be saved in Demo Mode')
      return
    }
    try {

      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  // Function to mark appointment as completed
  const markCompleted = async (appointmentId) => {
    if (isDemoMode) {
      toast.info('Changes cannot be saved in Demo Mode')
      return
    }
    try {
      const { data } = await axios.post(backendUrl + '/api/user/complete-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Function to make payment using razorpay
  const appointmentRazorpay = async (appointmentId) => {
    if (isDemoMode) {
      toast.info('Payments are simulated in Demo Mode')
      return
    }
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {

      toast.error('Payment initialization failed')
    }
  }

  const initPay = (order) => {
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // Check if key exists or if order is mock (starts with 'order_')
    const isMockOrder = !rzpKey || order.id.startsWith('order_');

    if (isMockOrder) {
      // Simulate payment for demo/mock environment
      simulatePaymentSuccess(order);
      return;
    }

    const options = {
      key: rzpKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
          if (data.success) {
            toast.success('Payment Successful!');
            navigate('/my-appointments')
            getUserAppointments()
          }
        } catch (error) {

          toast.error(error.message)
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay SDK failed:", err);
      // Fallback to simulation if SDK fails (e.g. script not loaded)
      simulatePaymentSuccess(order);
    }
  }

  const simulatePaymentSuccess = async (order) => {
    try {
      // Simulate user completing payment
      toast.info("Processing Payment...", { autoClose: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = {
        razorpay_order_id: order.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature'
      }

      const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
      if (data.success) {
        toast.success('Payment Successful!');
        getUserAppointments()
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      ;
      toast.error('Payment Simulation Failed');
    }
  }

  // Function to submit review
  const submitReview = async () => {
    if (isDemoMode) {
      toast.info('Changes cannot be saved in Demo Mode')
      setShowReviewModal(false)
      return
    }
    if (rating === 0) {
      toast.warning('Please select a rating')
      return
    }
    if (!reviewComment.trim()) {
      toast.warning('Please write a review')
      return
    }

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/add-review',
        {
          doctorId: selectedAppointment.docId,
          appointmentId: selectedAppointment._id,
          rating,
          comment: reviewComment
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        setShowReviewModal(false)
        setRating(0)
        setReviewComment('')
        setSelectedAppointment(null)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Function to open review modal
  const openReviewModal = (appointment) => {
    setSelectedAppointment(appointment)
    setShowReviewModal(true)
  }

  // Function to open reschedule modal and get available slots
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment)
    setShowRescheduleModal(true)
    generateRescheduleSlots(appointment.docId)
  }

  // Generate available slots for reschedule
  const generateRescheduleSlots = (docId) => {
    const doctor = doctors.find(d => d._id === docId)
    if (!doctor) return

    setRescheduleSlots([])
    const today = new Date()
    const slots = []

    for (let i = 1; i < 8; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      currentDate.setHours(10, 0, 0, 0)

      const timeSlots = []

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

        const day = currentDate.getDate()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const slotDate = `${day}_${month}_${year}`

        const isSlotAvailable = !doctor?.slots_booked?.[slotDate] || !doctor.slots_booked[slotDate].includes(formattedTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      slots.push(timeSlots)
    }

    setRescheduleSlots(slots)
  }

  // Function to reschedule appointment
  const rescheduleAppointment = async () => {
    if (isDemoMode) {
      toast.info('Changes cannot be saved in Demo Mode')
      setShowRescheduleModal(false)
      return
    }
    if (!rescheduleSlotTime) {
      toast.warning('Please select a time slot')
      return
    }

    const date = rescheduleSlots[rescheduleSlotIndex][0].datetime
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    const newSlotDate = `${day}_${month}_${year}`

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/reschedule-appointment',
        {
          appointmentId: selectedAppointment._id,
          newSlotDate,
          newSlotTime: rescheduleSlotTime
        },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        setShowRescheduleModal(false)
        setRescheduleSlotTime('')
        setRescheduleSlotIndex(0)
        setSelectedAppointment(null)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(item => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return !item.cancelled && !item.isCompleted
    if (filter === 'completed') return item.isCompleted
    if (filter === 'cancelled') return item.cancelled
    return true
  })

  useEffect(() => {
    if (token) { // Only fetch if token exists
      getUserAppointments()
      getDoctorsData()
    }
  }, [getUserAppointments, getDoctorsData, token])

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen'>

      {/* Header Section */}
      <div className='mb-8 sm:flex sm:items-center sm:justify-between animate-fade-in-up'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>My Appointments</h1>
          <p className='mt-2 text-sm text-gray-600'>Manage your upcoming visits and view history</p>
        </div>

        {/* Filter Tabs - Pill Shape */}
        <div className='mt-4 sm:mt-0 flex p-1 bg-gray-100 rounded-xl overflow-hidden shadow-inner'>
          {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${filter === tab
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <div
              key={index}
              className='group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-in-up'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header: Doctor Info & Status */}
              <div className='flex justify-between items-start mb-6'>
                <div className='flex gap-4'>
                  <div className='relative'>
                    <img
                      className='w-16 h-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300'
                      src={item.docData.image}
                      alt={item.docData.name}
                    />
                    <div className='absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full'>
                      <div className='w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                    </div>
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900 text-lg group-hover:text-primary transition-colors'>
                      {item.docData.name}
                    </h3>
                    <p className='text-primary text-sm font-medium'>{item.docData.speciality}</p>
                    <p className='text-xs text-gray-400 mt-1'>{item.docData.degree}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className='flex flex-col items-end gap-2'>
                  {item.cancelled ? (
                    <span className='px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className='px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100'>
                      Completed
                    </span>
                  ) : item.payment ? (
                    <span className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100'>
                      Upcoming
                    </span>
                  ) : (
                    <span className='px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full border border-yellow-100'>
                      Payment Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className='bg-gray-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Date & Time</span>
                  <div className='flex items-center gap-2 text-gray-700 font-semibold'>
                    <svg className='w-4 h-4 text-primary' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {slotDateFormat(item.slotDate)}
                  </div>
                  <div className='ml-6 text-sm text-gray-500'>{item.slotTime}</div>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Location</span>
                  <div className='flex items-start gap-2 text-xs text-gray-600 leading-snug'>
                    <svg className='w-4 h-4 text-primary mt-0.5 flex-shrink-0' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{item.docData.address.line1}, {item.docData.address.line2}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className='flex gap-3 pt-2 border-t border-gray-100'>
                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <>
                    {payment === item._id ? (
                      <button
                        onClick={() => appointmentRazorpay(item._id)}
                        className='flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2'
                      >
                        <img className='w-20' src={assets.razorpay_logo} alt="Pay with Razorpay" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toast.info("Payment Coming Soon")}
                        className='flex-1 bg-gradient-primary text-white py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300'
                      >
                        Pay Online
                      </button>
                    )}
                    <button
                      onClick={() => openRescheduleModal(item)}
                      className='px-4 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100'
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => markCompleted(item._id)}
                      className='px-4 py-2.5 rounded-lg text-primary font-medium hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors'
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='px-4 py-2.5 rounded-lg text-gray-400 font-medium hover:bg-red-50 hover:text-red-600 transition-colors'
                      title="Cancel Appointment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}

                {item.payment && !item.isCompleted && !item.cancelled && (
                  <div className='flex-1 flex gap-3'>
                    <button className='flex-1 bg-green-50 text-green-600 border border-green-200 py-2.5 rounded-lg font-medium cursor-default flex items-center justify-center gap-2'>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Paid
                    </button>
                    <button
                      onClick={() => openRescheduleModal(item)}
                      className='flex-1 text-gray-600 font-medium hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors'
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => markCompleted(item._id)}
                      className='px-3 text-primary font-medium hover:bg-blue-50 rounded-lg transition-colors'
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='px-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {item.isCompleted && (
                  <div className='flex-1 flex gap-3'>
                    <button className='flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-lg font-medium cursor-default'>
                      Visit Completed
                    </button>
                    <button
                      onClick={() => openReviewModal(item)}
                      className='flex-1 border border-primary text-primary hover:bg-primary hover:text-white py-2.5 rounded-lg font-medium transition-all duration-300'
                    >
                      Write Review
                    </button>
                  </div>
                )}

                {item.cancelled && (
                  <div className='flex-1 bg-red-50 text-red-500 py-2.5 rounded-lg font-medium text-center border dashed border-red-200'>
                    Appointment Cancelled
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200'>
            <div className='text-6xl mb-4'>📅</div>
            <h3 className='text-xl font-bold text-gray-900'>No Appointments Found</h3>
            <p className='text-gray-500 mt-2 text-center max-w-md'>
              {filter === 'all'
                ? "You haven't booked any appointments yet. Find a specialist to get started!"
                : `You don't have any ${filter} appointments.`}
            </p>
            <button
              onClick={() => navigate('/doctors')}
              className='mt-6 bg-gradient-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
            >
              Book New Appointment
            </button>
          </div>
        )}
      </div>

      {/* Review Modal - Same logic, slight styling tweak if needed */}
      {showReviewModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900'>Write a Review</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setRating(0)
                  setReviewComment('')
                }}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {selectedAppointment && (
              <div className='mb-6 flex items-center gap-4 p-4 bg-gray-50 rounded-xl'>
                <img src={selectedAppointment.docData.image} className='w-12 h-12 rounded-full object-cover' alt="" />
                <div>
                  <p className='text-sm text-gray-500'>Reviewing</p>
                  <p className='font-bold text-gray-900'>{selectedAppointment.docData.name}</p>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div className='mb-6 text-center'>
              <label className='block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide'>Rate your experience</label>
              <div className='flex justify-center gap-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all duration-200 hover:scale-110 ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 hover:text-yellow-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide'>Your Feedback</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder='Share your experience with this doctor...'
                className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow resize-none bg-gray-50 focus:bg-white'
                rows='4'
              />
            </div>

            {/* Submit Button */}
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setRating(0)
                  setReviewComment('')
                }}
                className='px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className='flex-1 bg-gradient-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300'
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl p-x-6 py-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl'>
            <div className='px-8 mb-6 flex justify-between items-center'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>Reschedule Appointment</h2>
                <p className='text-gray-500 text-sm mt-1'>Choose a new slot for your visit</p>
              </div>
              <button
                onClick={() => {
                  setShowRescheduleModal(false)
                  setRescheduleSlotTime('')
                  setRescheduleSlotIndex(0)
                }}
                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {selectedAppointment && (
              <div className='mx-8 mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between'>
                <div>
                  <p className='text-sm text-blue-600 font-medium mb-1'>Current Appointment</p>
                  <p className='text-gray-900 font-bold text-lg'>
                    {slotDateFormat(selectedAppointment.slotDate)} at {selectedAppointment.slotTime}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-blue-600 font-medium mb-1'>Doctor</p>
                  <p className='text-gray-900 font-semibold'>{selectedAppointment.docData.name}</p>
                </div>
              </div>
            )}

            {/* Date Slots */}
            <div className='px-8 mb-2'>
              <p className='text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide'>Select Date</p>
            </div>
            <div className='flex gap-4 items-center overflow-x-auto pb-4 px-8 scrollbar-hide'>
              {rescheduleSlots.length > 0 && rescheduleSlots.map((item, index) => (
                <div
                  onClick={() => { setRescheduleSlotIndex(index); setRescheduleSlotTime('') }}
                  className={`flex-shrink-0 text-center py-4 min-w-[4.5rem] rounded-2xl cursor-pointer transition-all duration-300 border-2 ${rescheduleSlotIndex === index
                    ? 'bg-primary text-white border-primary shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  key={index}
                >
                  <p className='text-xs font-medium uppercase mb-1 opacity-80'>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p className='text-xl font-bold'>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className='px-8 mb-2 mt-6'>
              <p className='text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide'>Select Time</p>
            </div>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 px-8 mb-8'>
              {rescheduleSlots.length > 0 && rescheduleSlots[rescheduleSlotIndex].map((item, index) => (
                <button
                  onClick={() => setRescheduleSlotTime(item.time)}
                  className={`text-sm font-medium py-2.5 rounded-xl transition-all duration-200 border ${item.time === rescheduleSlotTime
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </button>
              ))}
            </div>

            {/* Reschedule Button */}
            <div className='px-8 flex gap-4'>
              <button
                onClick={() => {
                  setShowRescheduleModal(false)
                  setRescheduleSlotTime('')
                  setRescheduleSlotIndex(0)
                }}
                className='px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={rescheduleAppointment}
                disabled={!rescheduleSlotTime}
                className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all duration-300 shadow-lg ${!rescheduleSlotTime
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-primary shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments
