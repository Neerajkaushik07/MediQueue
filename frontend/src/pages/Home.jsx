import React, { useContext, useState } from 'react'
import Header from '../components/Header'

import Banner from '../components/Banner'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

import DoctorDashboard from './Doctor/DoctorDashboard'
import SpecialityMenu from '../components/SpecialityMenu'


const Home = () => {
  const navigate = useNavigate()
  const { token, userRole, backendUrl } = useContext(AppContext)
  const isLoggedInPatient = token && userRole !== 'doctor'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscription = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/user/subscribe', { email })

      if (data.success) {
        toast.success("Subscribed successfully!")
        setEmail('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (token && userRole === 'doctor') {
    return <DoctorDashboard />
  }

  return (
    <div className='overflow-hidden'>
      {/* Hero Section */}
      <Header />

      {/* Features Section */}
      <div className='section-padding bg-gradient-primary mb-16 rounded-3xl'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <span className='trust-badge'>Why Choose MediQueue</span>
            <h2 className='text-4xl md:text-5xl font-bold medical-heading mt-4'>
              Healthcare You Can Trust
            </h2>
            <p className='mt-4 text-gray-600 max-w-2xl mx-auto'>
              Professional medical care with modern technology and compassionate service
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                ),
                title: 'Expert Doctors',
                description: '100+ certified and experienced medical professionals'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                ),
                title: 'Quick Booking',
                description: 'Schedule appointments in under 60 seconds'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ),
                title: 'Secure Platform',
                description: 'Your health data is encrypted and protected'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                  </svg>
                ),
                title: '24/7 Support',
                description: 'Round-the-clock healthcare assistance'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className='info-card group animate-fade-in-up bg-gradient-calm'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Speciality Menu */}
      <SpecialityMenu />


      {/* Testimonials Section */}
      <div className='section-padding bg-gradient-calm mb-16 rounded-3xl'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <span className='trust-badge'>Patient Testimonials</span>
            <h2 className='text-4xl md:text-5xl font-bold medical-heading mt-4'>
              What Our Patients Say
            </h2>
            <p className='mt-4 text-gray-600 max-w-2xl mx-auto'>
              Real experiences from people who trust us with their healthcare
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[
              {
                name: 'Sarah Johnson',
                role: 'Patient',
                review: 'Outstanding service! The doctors are professional and caring. Booking was incredibly easy and the medical care was excellent.',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Patient',
                review: 'Best healthcare platform I\'ve used. User-friendly interface and exceptional medical staff. Highly recommended!',
                rating: 5
              },
              {
                name: 'Emily Davis',
                role: 'Patient',
                review: 'From booking to consultation, everything was seamless. The doctors truly care about patient wellbeing and health.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className='medical-card p-8 animate-fade-in-up bg-gradient-primary'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className='flex gap-1 mb-4'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className='w-5 h-5 text-yellow-500' fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className='text-gray-700 mb-6 leading-relaxed'>
                  "{testimonial.review}"
                </p>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-gradient-calm rounded-full flex items-center justify-center'>
                    <svg className='w-6 h-6 text-primary' fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>{testimonial.name}</h4>
                    <p className='text-sm text-gray-600'>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className='mb-16'>
        <Banner />
      </div>

      {/* Trust & How It Works Section */}
      <div className={`section-padding mb-16 rounded-3xl ${isLoggedInPatient ? 'bg-gradient-primary' : 'bg-gradient-calm'}`}>
        <div className='max-w-7xl mx-auto'>
          {/* How It Works */}
          <div className='text-center mb-12'>
            <span className={`trust-badge ${isLoggedInPatient ? 'bg-white/10 text-white border-white/20' : ''}`}>Simple Process</span>
            <h2 className={`text-4xl md:text-5xl font-bold mt-4 ${isLoggedInPatient ? 'text-white' : 'medical-heading'}`}>
              How It Works
            </h2>
            <p className={`mt-4 max-w-2xl mx-auto ${isLoggedInPatient ? 'text-blue-50' : 'text-gray-600'}`}>
              Book your appointment in three easy steps
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-20'>
            {[
              {
                step: '1',
                title: 'Choose Your Doctor',
                description: 'Browse verified doctors by specialty, rating, and availability',
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                )
              },
              {
                step: '2',
                title: 'Book Appointment',
                description: 'Select your preferred time slot and confirm instantly',
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                )
              },
              {
                step: '3',
                title: 'Get Quality Care',
                description: 'Receive professional healthcare at your scheduled time',
                icon: (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`info-card text-center group animate-fade-in-up ${isLoggedInPatient ? 'bg-gradient-calm' : 'bg-gradient-primary'}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 ${isLoggedInPatient ? 'bg-gradient-primary text-white' : 'bg-white text-primary'}`}>
                  {item.icon}
                </div>
                <div className={`text-5xl font-bold mb-2 ${isLoggedInPatient ? 'gradient-text' : 'bg-gradient-calm bg-clip-text text-transparent'}`}>
                  {item.step}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isLoggedInPatient ? 'text-gray-900' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className={`leading-relaxed ${isLoggedInPatient ? 'text-gray-600' : 'text-blue-50'}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className='text-center'>
            <h3 className='text-gray-600 mb-6 text-sm font-medium'>Certified & Trusted By</h3>
            <div className='flex flex-wrap justify-center items-center gap-8'>
              {['WHO Certified', 'ISO 9001', 'HIPAA Compliant', 'JCI Accredited'].map((badge, index) => (
                <div
                  key={index}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold ${isLoggedInPatient ? 'bg-gradient-calm text-gray-900' : 'bg-gradient-primary text-white'}`}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className={`section-padding mb-16 rounded-3xl ${isLoggedInPatient ? 'bg-gradient-calm' : 'bg-gradient-primary'}`}>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='mb-6'>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${isLoggedInPatient ? 'bg-gradient-primary text-white' : 'bg-gradient-calm text-primary'}`}>
              Stay Informed
            </span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isLoggedInPatient ? 'text-gray-900' : 'text-white'}`}>
            Subscribe to Health Updates
          </h2>
          <p className={`mb-8 leading-relaxed max-w-2xl mx-auto ${isLoggedInPatient ? 'text-gray-700' : 'text-blue-50'}`}>
            Get expert health advice, wellness tips, and the latest medical updates delivered to your inbox
          </p>
          <form onSubmit={handleSubscription} className='flex flex-col sm:flex-row gap-4 max-w-xl mx-auto'>
            <input
              type='email'
              placeholder='Enter your email address'
              className='flex-1 px-6 py-4 rounded-lg outline-none text-gray-900 bg-white focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type='submit'
              disabled={loading}
              className={`px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isLoggedInPatient ? 'bg-gradient-primary text-white' : 'bg-gradient-calm text-primary'}`}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className={`text-sm mt-4 ${isLoggedInPatient ? 'text-gray-600' : 'text-blue-100'}`}>
            Your privacy is protected. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
