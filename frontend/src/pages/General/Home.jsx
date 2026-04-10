import React, { useContext } from 'react'
import Header from '../../components/Layout/Header'
import SpecialityMenu from '../../components/Shared/SpecialityMenu'
import TopDoctors from '../../components/Shared/TopDoctors'
import Testimonials from '../../components/Shared/Testimonials'
import FAQ from '../../components/Shared/FAQ'
import Banner from '../../components/Layout/Banner'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

import DoctorDashboard from '../Doctor/DoctorDashboard'


const Home = () => {
  const navigate = useNavigate()
  const { token, userRole } = useContext(AppContext)
  const isLoggedInPatient = token && userRole !== 'doctor'

  const featureHighlights = [
    {
      title: 'Verified Clinical Experts',
      description: 'Consult trusted professionals across specialties with transparent profiles.',
      tone: 'from-cyan-500 to-blue-600',
      icon: (
        <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7m8-10a3 3 0 11-6 0 3 3 0 016 0z' />
        </svg>
      )
    },
    {
      title: 'Fast Appointment Flow',
      description: 'From discovery to confirmation in minutes, optimized for mobile and desktop.',
      tone: 'from-emerald-500 to-teal-600',
      icon: (
        <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
        </svg>
      )
    },
    {
      title: 'Private and Secure',
      description: 'Patient details and communication stay protected with strong access controls.',
      tone: 'from-amber-500 to-orange-600',
      icon: (
        <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm0 0v3m7-2a9 9 0 11-18 0 9 9 0 0118 0zm-4.5 0a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' />
        </svg>
      )
    },
    {
      title: 'Support That Responds',
      description: 'Questions and care coordination support from a team that actually follows through.',
      tone: 'from-fuchsia-500 to-pink-600',
      icon: (
        <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.82L3 20l1.314-3.066A7.708 7.708 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
        </svg>
      )
    }
  ]

  const processSteps = [
    {
      step: '01',
      title: 'Search By Need',
      description: 'Filter by specialty and find doctors aligned with your care requirements.'
    },
    {
      step: '02',
      title: 'Pick A Time Slot',
      description: 'Select a convenient slot and book instantly with clear availability.'
    },
    {
      step: '03',
      title: 'Manage Ongoing Care',
      description: 'Track upcoming visits, reminders, and care continuity from one place.'
    }
  ]

  const trustBadges = ['WHO Certified', 'ISO 9001', 'HIPAA Aligned', 'JCI Standards']


  if (token && userRole === 'doctor') {
    return <DoctorDashboard />
  }

  return (
    <div className='overflow-hidden px-4 md:px-6'>
      <div className='max-w-7xl mx-auto'>


        {/* Hero Section */}
        <Header />

        {/* Feature Highlights */}
        <section className='mb-16'>
          <div className='text-center mb-10'>
            <span className='inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs md:text-sm font-semibold text-cyan-700'>
              Why MediQueue
            </span>
            <h2 className='mt-4 text-4xl md:text-5xl font-black text-slate-900' style={{ fontFamily: 'Outfit, sans-serif' }}>
              Care, Technology, And Trust
            </h2>
            <p className='mt-4 text-slate-600 max-w-2xl mx-auto'>
              Designed to help patients move from uncertainty to care quickly, safely, and confidently.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5'>
            {featureHighlights.map((feature, index) => (
              <article
                key={feature.title}
                className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in-up'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.tone} text-white flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-2' style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className='text-slate-600 leading-relaxed'>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Speciality Menu */}
        <section className='mb-10 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm px-2 md:px-4'>
          <SpecialityMenu />
        </section>

        {/* Top Doctors */}
        <section className='mb-8'>
          <TopDoctors />
        </section>

        {/* Care Paths */}
        <section className='mb-16 rounded-3xl border border-slate-200 bg-slate-900 p-6 md:p-10 relative overflow-hidden'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.25),transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.22),transparent_40%)]'></div>
          <div className='relative'>
            <div className='text-center mb-10'>
              <p className='text-cyan-300 font-semibold text-sm tracking-wide uppercase'>Simple Experience</p>
              <h2 className='text-3xl md:text-5xl font-black text-white mt-2' style={{ fontFamily: 'Outfit, sans-serif' }}>
                Your Care Journey In 3 Steps
              </h2>
              <p className='mt-3 text-slate-300 max-w-2xl mx-auto'>
                A flow built to reduce friction for first-time bookings and ongoing care management.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-10'>
              {processSteps.map((item, index) => (
                <div
                  key={item.step}
                  className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm animate-fade-in-up'
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <p className='text-cyan-300 text-sm font-bold mb-3'>STEP {item.step}</p>
                  <h3 className='text-xl font-bold text-white mb-2' style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</h3>
                  <p className='text-slate-300 leading-relaxed'>{item.description}</p>
                </div>
              ))}
            </div>

            <div className='flex flex-wrap justify-center gap-3'>
              {trustBadges.map((badge) => (
                <span key={badge} className='inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100'>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Contextual CTA Banner */}
        <div className='mb-16'>
          <Banner />
        </div>

        <section className={`mb-16 rounded-3xl p-6 md:p-10 border ${isLoggedInPatient ? 'bg-gradient-to-r from-cyan-50 to-emerald-50 border-cyan-100' : 'bg-gradient-to-r from-slate-900 to-cyan-950 border-slate-700'}`}>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isLoggedInPatient ? 'text-cyan-700' : 'text-cyan-300'}`}>
                Personalized Next Step
              </p>
              <h3 className={`text-3xl md:text-4xl font-black mt-2 ${isLoggedInPatient ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                {isLoggedInPatient ? 'Ready for your next appointment?' : 'Start your first booking today'}
              </h3>
              <p className={`mt-4 leading-relaxed ${isLoggedInPatient ? 'text-slate-600' : 'text-slate-300'}`}>
                {isLoggedInPatient
                  ? 'Browse available specialists and secure your next consultation with just a few clicks.'
                  : 'Create your profile to book appointments faster, get reminders, and manage healthcare in one place.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-3 lg:justify-end'>
              <button
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${isLoggedInPatient ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-white text-cyan-800 hover:bg-cyan-50'}`}
              >
                Explore Doctors
              </button>
              {!token && (
                <button
                  onClick={() => { navigate('/login'); scrollTo(0, 0) }}
                  className='px-6 py-3 rounded-xl font-semibold border border-cyan-200 bg-transparent text-cyan-100 hover:bg-cyan-500/10 transition-all'
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />
      </div>
    </div>
  )
}

export default Home
