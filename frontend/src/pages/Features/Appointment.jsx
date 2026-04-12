import React, { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

import axios from 'axios'
import { toast } from 'react-toastify'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const stripeAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  }
};

const StripeCheckoutForm = ({ appointmentId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast.error(submitError.message);
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/my-appointments' },
        redirect: 'if_required'
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id, appointmentId);
      } else {
        toast.error('Payment failed');
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error(err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 rounded-xl shadow-inner">
        <PaymentElement options={{ layout: "accordion" }} />
      </div>
      <div className="flex gap-4 mt-6">
        <button type="button" onClick={onCancel} disabled={isProcessing} className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:bg-gray-800 hover:text-gray-900 dark:text-white transition-all duration-200 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={!stripe || isProcessing} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2">
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Pay Securely
            </>
          )}
        </button>
      </div>
    </form>
  )
}


const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [showStripeModal, setShowStripeModal] = useState(false)
  const [stripeClientSecret, setStripeClientSecret] = useState('')
  const [paymentAppointmentId, setPaymentAppointmentId] = useState('')

  const fetchDocInfo = useCallback(async () => {
    const doc = doctors.find((doc) => doc._id === docId)
    if (doc) {
      // Ensure slots_booked is always at least an empty object
      setDocInfo({ ...doc, slots_booked: doc.slots_booked || {} })
    }
  }, [doctors, docId])

  const getAvailableSlots = useCallback(() => {
    if (!docInfo) return
    setDocSlots([])

    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      const endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

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
        const slotTime = formattedTime

        const isSlotAvailable =
          !docInfo?.slots_booked?.[slotDate] ||
          !docInfo.slots_booked[slotDate].includes(slotTime)

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      setDocSlots((prev) => [...prev, timeSlots])
    }
  }, [docInfo])

  const bookAppointment = async () => {

    if (!docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
      toast.warning('No slots available for this date')
      return
    }

    const date = docSlots[slotIndex][0].datetime

    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    const slotDate = day + "_" + month + "_" + year

    try {

      if (token === 'demo-token') {
        toast.success('Appointment booked successfully! (Demo Mode)')
        navigate('/my-appointments')
        return
      }

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment-lock', { docId, slotDate, slotTime }, { headers: { token } })
      if (data.success) {
        toast.info(data.message)
        getDoctorsData()
        setStripeClientSecret(data.clientSecret);
        setPaymentAppointmentId(data.appointmentId);
        setShowStripeModal(true);
      } else {
        toast.error(data.message)
      }

    } catch (error) {

      toast.error(error.message)
    }

  }

  const handleStripeSuccess = async (paymentIntentId, appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-stripe', { paymentIntentId }, { headers: { token } })
      if (data.success) {
        toast.success('Payment Successful! Appointment Confirmed.')
        setShowStripeModal(false)
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCancelHold = async () => {
    setShowStripeModal(false)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment-lock', { appointmentId: paymentAppointmentId }, { headers: { token } })
      if (data.success) {
        toast.info('Hold released. Slot is available again.')
        getDoctorsData()
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [fetchDocInfo, doctors.length])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [getAvailableSlots, docInfo])

  return (
    docInfo && (
      <div>
        {/* Doctor details */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
          </div>
          <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white dark:bg-gray-800 mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
            <p className='flex items-center gap-2 text-3xl font-medium text-gray-700 dark:text-gray-200'>
              {docInfo.name} <img src={assets.verified_icon} alt="" />
            </p>
            <div className='flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300'>
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
            </div>
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300 max-w-[700px] mt-1'>{docInfo.about}</p>
            </div>
            <p className='text-gray-600 dark:text-gray-300 font-medium mt-4'>
              Appointment fee: <span className='text-gray-800 dark:text-gray-100'>{currencySymbol} {docInfo.fees}</span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
          <p>Booking slots</p>

          {/* Days Scroll */}
          <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  key={index}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'
                    }`}
                >
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>

          {/* Time Slots Scroll */}
          <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
            {docSlots.length > 0 &&
              docSlots[slotIndex] &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  key={index}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime
                    ? 'bg-primary text-white'
                    : 'text-[#949494] border border-[#B4B4B4]'
                    }`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>

          {/* Book Button */}
          <button
            onClick={bookAppointment}
            className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'
          >
            Book an appointment
          </button>
        </div>

        {/* Stripe Payment Modal */}
        {showStripeModal && stripeClientSecret && (
          <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4 sm:p-6'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] mt-10'>
              <div className='bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 border-b border-blue-100 flex justify-between items-center shrink-0'>
                <div>
                  <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Complete Payment</h3>
                  <p className='text-sm text-blue-600 font-medium mt-1'>Slot is locked for 10 minutes</p>
                </div>
                <button onClick={handleCancelHold} className='text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors p-2 hover:bg-white dark:bg-gray-800 rounded-full shrink-0'>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className='p-6 overflow-y-auto'>
                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: stripeAppearance }}>
                  <StripeCheckoutForm
                    appointmentId={paymentAppointmentId}
                    onSuccess={handleStripeSuccess}
                    onCancel={handleCancelHold}
                  />
                </Elements>
              </div>
            </div>
          </div>
        )}

      </div>
    )
  )
}

export default Appointment
