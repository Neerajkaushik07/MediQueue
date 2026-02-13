import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const AboutContact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })

    const [showCareers, setShowCareers] = useState(false)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState(null)
    const [applicationData, setApplicationData] = useState({
        fullName: '',
        email: '',
        phone: '',
        linkedIn: '',
        resume: null,
        coverLetter: ''
    })

    const careerPositions = [
        {
            title: 'Senior Backend Developer',
            department: 'Engineering',
            location: 'Remote / New York',
            type: 'Full-time',
            description: 'Build scalable healthcare APIs and microservices using Node.js and MongoDB.'
        },
        {
            title: 'Frontend React Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            description: 'Create beautiful, responsive user interfaces for our patient portal.'
        },
        {
            title: 'Healthcare Product Manager',
            department: 'Product',
            location: 'Hybrid / San Francisco',
            type: 'Full-time',
            description: 'Lead product strategy for our telemedicine and appointment management platform.'
        },
        {
            title: 'UX/UI Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Contract',
            description: 'Design intuitive healthcare experiences for patients and medical professionals.'
        },
        {
            title: 'Medical Content Writer',
            department: 'Content',
            location: 'Remote',
            type: 'Part-time',
            description: 'Create engaging, accurate health content for our blog and educational resources.'
        },
        {
            title: 'Customer Success Manager',
            department: 'Operations',
            location: 'Hybrid / Boston',
            type: 'Full-time',
            description: 'Ensure hospitals and clinics maximize value from our platform.'
        }
    ]

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const features = [
        {
            title: 'Efficiency',
            description: 'Streamlined appointment scheduling that fits into your busy lifestyle.',
            icon: (
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
            ),
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Convenience',
            description: 'Access to a network of trusted healthcare professionals in your area.',
            icon: (
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
            ),
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Personalization',
            description: 'Tailored recommendations and reminders to help you stay on top of your health.',
            icon: (
                <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
            ),
            color: 'from-green-500 to-teal-500'
        }
    ]

    const stats = [
        { number: '10,000+', label: 'Happy Patients', icon: '👥' },
        { number: '500+', label: 'Expert Doctors', icon: '⚕️' },
        { number: '50+', label: 'Specializations', icon: '🏥' },
        { number: '24/7', label: 'Support Available', icon: '💬' }
    ]

    const values = [
        {
            title: 'Patient-Centered Care',
            description: 'Your health and comfort are our top priorities. We ensure every interaction is meaningful.',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                </svg>
            )
        },
        {
            title: 'Quality & Excellence',
            description: 'We maintain the highest standards in healthcare delivery and patient service.',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
                </svg>
            )
        },
        {
            title: 'Innovation',
            description: 'Leveraging cutting-edge technology to provide seamless healthcare experiences.',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
                </svg>
            )
        },
        {
            title: 'Accessibility',
            description: 'Making quality healthcare accessible to everyone, everywhere, anytime.',
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
            )
        }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^\d{10}$/.test(formData.phone.replace(/[-()\s]/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits'
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required'
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required'
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters'
        }

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsSubmitting(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('Message sent successfully! We\'ll get back to you soon.')
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            })
        } catch {
            toast.error('Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleApplyClick = (position) => {
        setSelectedPosition(position)
        setShowApplicationModal(true)
    }

    const handleApplicationChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'resume') {
            setApplicationData(prev => ({ ...prev, resume: files[0] }))
        } else {
            setApplicationData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleApplicationSubmit = async (e) => {
        e.preventDefault()

        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success(`Application submitted for ${selectedPosition.title}! We'll review it shortly.`)
            setApplicationData({
                fullName: '',
                email: '',
                phone: '',
                linkedIn: '',
                resume: null,
                coverLetter: ''
            })
            setShowApplicationModal(false)
            setSelectedPosition(null)
        } catch {
            toast.error('Failed to submit application. Please try again.')
        }
    }

    return (
        <div className='min-h-screen py-10 animate-fade-in'>
            {/* Hero Section */}
            <div className='text-center mb-16 px-4'>
                <span className='inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-primary text-sm font-semibold mb-4'>
                    About Us & Contact
                </span>
                <h1 className='text-4xl md:text-5xl font-bold luxury-heading mb-4'>
                    Your Trusted Healthcare <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600'>Partner</span>
                </h1>
                <p className='text-gray-600 max-w-2xl mx-auto leading-relaxed'>
                    Revolutionizing healthcare management with innovative technology and compassionate care
                </p>
            </div>

            {/* Main About Section */}
            <div className='max-w-6xl mx-auto px-4 mb-20'>
                <div className='glass-card rounded-3xl overflow-hidden'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-0'>
                        <div className='relative h-64 lg:h-auto'>
                            <img
                                className='w-full h-full object-cover'
                                src={assets.about_image}
                                alt="About MediQueue"
                            />
                            <div className='absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20'></div>
                        </div>
                        <div className='p-8 lg:p-12 flex flex-col justify-center'>
                            <h2 className='text-3xl font-bold text-gray-900 mb-6'>Who We Are</h2>
                            <div className='space-y-4 text-gray-700 leading-relaxed'>
                                <p>
                                    Welcome to <strong className='text-primary'>MediQueue</strong>, your trusted partner in managing your healthcare needs conveniently and efficiently. We understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
                                </p>
                                <p>
                                    MediQueue is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service.
                                </p>
                                <p>
                                    Whether you're booking your first appointment or managing ongoing care, MediQueue is here to support you every step of the way.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision & Mission Section */}
            <div className='max-w-6xl mx-auto px-4 mb-20'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='glass-card rounded-3xl p-8 border-l-4 border-primary hover:shadow-luxury transition-all duration-500'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center'>
                                <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                                </svg>
                            </div>
                            <h3 className='text-2xl font-bold text-gray-900'>Our Vision</h3>
                        </div>
                        <p className='text-gray-700 leading-relaxed'>
                            Our vision at MediQueue is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
                        </p>
                    </div>

                    <div className='glass-card rounded-3xl p-8 border-l-4 border-purple-600 hover:shadow-luxury transition-all duration-500'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center'>
                                <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                                </svg>
                            </div>
                            <h3 className='text-2xl font-bold text-gray-900'>Our Mission</h3>
                        </div>
                        <p className='text-gray-700 leading-relaxed'>
                            To empower individuals with easy access to quality healthcare through innovative technology, exceptional service, and a commitment to improving health outcomes for communities worldwide.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className='max-w-6xl mx-auto px-4 mb-20'>
                <div className='glass-card rounded-3xl p-8 bg-gradient-to-br from-primary/5 to-purple-600/5'>
                    <h3 className='text-2xl font-bold text-center text-gray-900 mb-10'>Our Impact in Numbers</h3>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                        {stats.map((stat, index) => (
                            <div key={index} className='text-center animate-scale-in' style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className='text-4xl mb-3'>{stat.icon}</div>
                                <div className='text-3xl font-bold text-primary mb-2'>{stat.number}</div>
                                <div className='text-sm text-gray-600 font-medium'>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className='max-w-6xl mx-auto px-4 mb-20'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                        Why Choose <span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600'>MediQueue</span>
                    </h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Experience healthcare management like never before with our innovative features
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='glass-card rounded-3xl p-8 hover:shadow-luxury transition-all duration-500 group animate-scale-in'
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className='text-xl font-bold text-gray-900 mb-3'>{feature.title}</h3>
                            <p className='text-gray-600 leading-relaxed'>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Core Values Section */}
            <div className='max-w-6xl mx-auto px-4 mb-20'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Our Core Values</h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        The principles that guide everything we do
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {values.map((value, index) => (
                        <div
                            key={index}
                            className='glass-card rounded-2xl p-6 hover:shadow-luxury transition-all duration-500 group animate-scale-in'
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className='flex items-start gap-4'>
                                <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300'>
                                    {value.icon}
                                </div>
                                <div>
                                    <h3 className='text-lg font-bold text-gray-900 mb-2'>{value.title}</h3>
                                    <p className='text-sm text-gray-600 leading-relaxed'>{value.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className='max-w-6xl mx-auto px-4 mb-20'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Get In Touch</h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Have questions or need assistance? We're here to help. Reach out to us and we'll respond as soon as possible.
                    </p>
                </div>

                {/* Contact Info Cards */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
                    <div className='glass-card rounded-2xl p-6 hover:shadow-luxury transition-all duration-500 group text-center'>
                        <div className='w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                            </svg>
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>Our Office</h3>
                        <p className='text-sm text-gray-600 leading-relaxed'>
                            54709 Willms Station<br />
                            Suite 350, Washington, USA
                        </p>
                    </div>

                    <div className='glass-card rounded-2xl p-6 hover:shadow-luxury transition-all duration-500 group text-center'>
                        <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                            </svg>
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>Phone</h3>
                        <p className='text-sm text-gray-600 leading-relaxed'>
                            Tel: (415) 555-0132<br />
                            Mon-Fri: 9AM - 6PM
                        </p>
                    </div>

                    <div className='glass-card rounded-2xl p-6 hover:shadow-luxury transition-all duration-500 group text-center'>
                        <div className='w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300'>
                            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                            </svg>
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>Email</h3>
                        <p className='text-sm text-gray-600 leading-relaxed'>
                            customersupport@mediqueue.in<br />
                            We'll respond within 24 hours
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                    {/* Left Side - Additional Info */}
                    <div className='space-y-6'>
                        <div className='glass-card rounded-3xl overflow-hidden'>
                            <img className='w-full h-72 object-cover' src={assets.contact_image} alt="Contact" />
                        </div>

                        <div className='glass-card rounded-3xl p-8'>
                            <div className='flex items-start gap-4 mb-6'>
                                <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center'>
                                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Business Hours</h3>
                                    <div className='space-y-1 text-sm text-gray-600'>
                                        <p className='flex justify-between'><span>Monday - Friday:</span> <span className='font-semibold'>9:00 AM - 6:00 PM</span></p>
                                        <p className='flex justify-between'><span>Saturday:</span> <span className='font-semibold'>10:00 AM - 4:00 PM</span></p>
                                        <p className='flex justify-between'><span>Sunday:</span> <span className='font-semibold'>Closed</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-start gap-4 mb-6'>
                                <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
                                    <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                    </svg>
                                </div>
                                <div className='flex-1'>
                                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Careers at MediQueue</h3>
                                    <p className='text-sm text-gray-600 mb-4 leading-relaxed'>
                                        Join our team and help revolutionize healthcare delivery. We're hiring talented professionals!
                                    </p>
                                    <button
                                        onClick={() => setShowCareers(!showCareers)}
                                        className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-glow transition-all duration-300 flex items-center gap-2'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                        </svg>
                                        {showCareers ? 'Hide' : 'View'} Open Positions
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${showCareers ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                                        </svg>
                                    </button>

                                    {showCareers && (
                                        <div className='mt-4 space-y-3 animate-fade-in'>
                                            {careerPositions.map((position, index) => (
                                                <div key={index} className='bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300'>
                                                    <div className='flex items-start justify-between gap-4 mb-2'>
                                                        <div>
                                                            <h4 className='font-bold text-gray-900 text-sm'>{position.title}</h4>
                                                            <div className='flex items-center gap-2 mt-1 flex-wrap'>
                                                                <span className='inline-flex items-center gap-1 text-xs text-gray-600'>
                                                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                                                    </svg>
                                                                    {position.department}
                                                                </span>
                                                                <span className='text-gray-400'>•</span>
                                                                <span className='inline-flex items-center gap-1 text-xs text-gray-600'>
                                                                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                                                    </svg>
                                                                    {position.location}
                                                                </span>
                                                                <span className='text-gray-400'>•</span>
                                                                <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium'>
                                                                    {position.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className='text-xs text-gray-600 mb-3 leading-relaxed'>{position.description}</p>
                                                    <button
                                                        onClick={() => handleApplyClick(position)}
                                                        className='text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group'
                                                    >
                                                        Apply Now
                                                        <svg className='w-3 h-3 group-hover:translate-x-1 transition-transform duration-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='pt-6 border-t border-gray-200'>
                                <h4 className='font-bold text-gray-900 mb-3'>Follow Us</h4>
                                <div className='flex gap-3'>
                                    <button className='w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300'>
                                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                                        </svg>
                                    </button>
                                    <button className='w-10 h-10 bg-blue-400 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300'>
                                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                                        </svg>
                                    </button>
                                    <button className='w-10 h-10 bg-blue-700 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300'>
                                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                                        </svg>
                                    </button>
                                    <button className='w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300'>
                                        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z' />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Contact Form */}
                    <div className='glass-card rounded-3xl p-8 lg:p-10'>
                        <h3 className='text-3xl font-bold text-gray-900 mb-2'>Send us a Message</h3>
                        <p className='text-gray-600 mb-8'>Fill out the form below and we'll get back to you within 24 hours.</p>

                        <form onSubmit={handleSubmit} className='space-y-6'>
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                                    <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                    </svg>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                        }`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className='text-red-500 text-xs mt-2 flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                    </svg>
                                    {errors.name}
                                </p>}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                                        <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                        </svg>
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                            }`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className='text-red-500 text-xs mt-2 flex items-center gap-1'>
                                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                            <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                        </svg>
                                        {errors.email}
                                    </p>}
                                </div>

                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                                        <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                        </svg>
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                            }`}
                                        placeholder="(123) 456-7890"
                                    />
                                    {errors.phone && <p className='text-red-500 text-xs mt-2 flex items-center gap-1'>
                                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                            <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                        </svg>
                                        {errors.phone}
                                    </p>}
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                                    <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                                    </svg>
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.subject ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                        }`}
                                    placeholder="What is this regarding?"
                                />
                                {errors.subject && <p className='text-red-500 text-xs mt-2 flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                    </svg>
                                    {errors.subject}
                                </p>}
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2'>
                                    <svg className='w-4 h-4 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                    </svg>
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    className={`w-full px-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${errors.message ? 'border-red-500' : 'border-gray-200 focus:border-primary'
                                        }`}
                                    placeholder="Tell us more about your inquiry..."
                                />
                                {errors.message && <p className='text-red-500 text-xs mt-2 flex items-center gap-1'>
                                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                    </svg>
                                    {errors.message}
                                </p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className='w-full bg-gradient-to-r from-primary to-purple-600 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group'
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className='w-5 h-5 animate-spin' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                        </svg>
                                        Sending Message...
                                    </>
                                ) : (
                                    <>
                                        <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                                        </svg>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {showApplicationModal && selectedPosition && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in'>
                    <div className='bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-luxury'>
                        <div className='sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl flex items-center justify-between'>
                            <div>
                                <h3 className='text-2xl font-bold mb-1'>Apply for Position</h3>
                                <p className='text-purple-100 text-sm'>{selectedPosition.title}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowApplicationModal(false)
                                    setSelectedPosition(null)
                                }}
                                className='w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all'
                            >
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleApplicationSubmit} className='p-6 space-y-5'>
                            <div className='bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className='font-bold text-gray-900 text-sm mb-1'>{selectedPosition.title}</h4>
                                        <p className='text-xs text-gray-600'>{selectedPosition.department} • {selectedPosition.location} • {selectedPosition.type}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={applicationData.fullName}
                                    onChange={handleApplicationChange}
                                    required
                                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all'
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={applicationData.email}
                                        onChange={handleApplicationChange}
                                        required
                                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all'
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={applicationData.phone}
                                        onChange={handleApplicationChange}
                                        required
                                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all'
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>LinkedIn Profile (Optional)</label>
                                <input
                                    type="url"
                                    name="linkedIn"
                                    value={applicationData.linkedIn}
                                    onChange={handleApplicationChange}
                                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all'
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>Resume/CV *</label>
                                <div className='relative'>
                                    <input
                                        type="file"
                                        name="resume"
                                        onChange={handleApplicationChange}
                                        accept=".pdf,.doc,.docx"
                                        required
                                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer'
                                    />
                                </div>
                                <p className='text-xs text-gray-500 mt-2'>PDF, DOC, or DOCX (Max 5MB)</p>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>Cover Letter</label>
                                <textarea
                                    name="coverLetter"
                                    value={applicationData.coverLetter}
                                    onChange={handleApplicationChange}
                                    rows="6"
                                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none'
                                    placeholder="Tell us why you're a great fit for this role..."
                                ></textarea>
                            </div>

                            <div className='flex gap-3 pt-4'>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApplicationModal(false)
                                        setSelectedPosition(null)
                                    }}
                                    className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all'
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className='flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2'
                                >
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                                    </svg>
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AboutContact
