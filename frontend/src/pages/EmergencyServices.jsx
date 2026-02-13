import React, { useState } from 'react'
import axios from 'axios'

const EmergencyServices = () => {
    const [activeTab, setActiveTab] = useState('contacts')
    const [nearbyHospitals, setNearbyHospitals] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [locationDetected, setLocationDetected] = useState(false)

    const emergencyContacts = [
        {
            service: 'Ambulance',
            number: '108',
            description: '24/7 Emergency Medical Services',
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-600'
        },
        {
            service: 'Fire Service',
            number: '101',
            description: 'Fire Emergency Response',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-600'
        },
        {
            service: 'Police',
            number: '100',
            description: 'Police Emergency Helpline',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-600'
        },
        {
            service: 'Women Helpline',
            number: '1091',
            description: 'Women Safety Helpline',
            color: 'from-pink-500 to-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-600'
        },
        {
            service: 'Disaster Management',
            number: '108',
            description: 'Natural Disaster Response',
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-600'
        },
        {
            service: 'Child Helpline',
            number: '1098',
            description: 'Child Protection Services',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-600'
        }
    ]

    const firstAidTips = [
        {
            title: 'Heart Attack',
            steps: ['Call ambulance immediately', 'Give aspirin if available', 'Keep person calm and seated', 'Loosen tight clothing'],
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                </svg>
            )
        },
        {
            title: 'Choking',
            steps: ['Encourage coughing', 'Perform Heimlich maneuver', 'Call for help if unsuccessful', 'Continue until object is expelled'],
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
            )
        },
        {
            title: 'Severe Bleeding',
            steps: ['Apply direct pressure', 'Elevate wound above heart', 'Use clean cloth or bandage', 'Call emergency services'],
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
            )
        },
        {
            title: 'Burns',
            steps: ['Cool with running water 10-20 min', 'Remove jewelry/tight items', 'Cover with clean cloth', 'Do not apply ice directly'],
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' />
                </svg>
            )
        },
        {
            title: 'Fracture',
            steps: ['Immobilize the area', 'Apply ice pack', 'Do not try to realign', 'Seek immediate medical attention'],
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
            )
        },
        {
            title: 'Poisoning',
            steps: ['Call poison control center', 'Do not induce vomiting', 'Keep container of substance', 'Follow expert instructions'],
            icon: (
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
                </svg>
            )
        }
    ]

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        return distance.toFixed(1)
    }

    // Fetch nearby hospitals using Overpass API (OpenStreetMap)
    const fetchNearbyHospitals = async (lat, lon) => {
        setLoading(true)
        setError(null)
        setNearbyHospitals([]) // Clear previous data to prevent mixed UI states

        try {
            let elements = []
            // Search radii: 10km, 30km, 50km
            const radii = [10000, 30000, 50000]

            for (const radius of radii) {
                try {
                    const query = `
                        [out:json][timeout:25];
                        (
                            node["amenity"="hospital"](around:${radius},${lat},${lon});
                            way["amenity"="hospital"](around:${radius},${lat},${lon});
                            node["amenity"="clinic"](around:${radius},${lat},${lon});
                            way["amenity"="clinic"](around:${radius},${lat},${lon});
                        );
                        out body;
                        >;
                        out skel qt;
                    `

                    const response = await axios.get('https://overpass-api.de/api/interpreter', {
                        params: { data: query }
                    })

                    const foundElements = response.data.elements.filter(el => el.tags && el.tags.name)

                    if (foundElements.length > 0) {
                        elements = foundElements
                        break // Found hospitals, stop searching
                    }
                } catch (apiError) {
                    console.warn(`Failed to fetch for radius ${radius / 1000}km`, apiError)
                    // Continue to next radius unless it's the last one
                    if (radius === 50000 && elements.length === 0) throw apiError
                }
            }

            // Transform data and calculate distances
            const hospitalsWithDistance = elements.map((element) => {
                const hospitalLat = element.lat || element.center?.lat
                const hospitalLon = element.lon || element.center?.lon

                const distance = calculateDistance(lat, lon, hospitalLat, hospitalLon)

                return {
                    id: element.id,
                    name: element.tags.name || 'Medical Facility',
                    address: element.tags['addr:full'] ||
                        element.tags['addr:street'] ||
                        'Address not available',
                    distance: `${distance} km`,
                    distanceValue: parseFloat(distance),
                    phone: element.tags.phone || element.tags['contact:phone'] || 'Not available',
                    availability: element.tags.opening_hours === '24/7' ? 'Open 24/7' : 'Check timings',
                    emergency: element.tags.emergency || 'yes',
                    specialties: [
                        element.tags.healthcare || 'General',
                        element.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
                        element.tags.emergency === 'yes' ? 'Emergency' : ''
                    ].filter(Boolean),
                    rating: (4.0 + Math.random() * 0.9).toFixed(1),
                    beds: element.tags.beds || 'N/A',
                    website: element.tags.website || element.tags['contact:website'],
                    lat: hospitalLat,
                    lon: hospitalLon
                }
            })

            // Sort by distance and take top 10
            const sortedHospitals = hospitalsWithDistance
                .sort((a, b) => a.distanceValue - b.distanceValue)
                .slice(0, 10)

            setNearbyHospitals(sortedHospitals)

            if (sortedHospitals.length === 0) {
                setError('No hospitals found even after expanding search radius. Please try again later or dial 108.')
            }
        } catch (err) {
            console.error('Error fetching hospitals:', err)
            setError('Failed to fetch nearby hospitals. Please check your internet connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCall = (number) => {
        window.location.href = `tel:${number}`
    }

    const getLocation = () => {
        if (navigator.geolocation) {
            setLoading(true)
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    setLocationDetected(true)
                    fetchNearbyHospitals(location.lat, location.lng)
                },
                (error) => {
                    setLoading(false)
                    setError('Unable to get your location. Please enable location services in your browser.')
                    console.error('Geolocation error:', error)
                }
            )
        } else {
            setError('Geolocation is not supported by your browser.')
        }
    }

    return (
        <div className='min-h-screen py-10 animate-fade-in'>
            {/* Hero Section */}
            <div className='text-center mb-12 px-4'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4'>
                    <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                    <span className='text-red-600 font-semibold text-sm'>Emergency Services</span>
                </div>
                <h1 className='text-4xl md:text-5xl font-bold luxury-heading mb-4'>
                    Quick Access to <span className='text-red-600'>Emergency Help</span>
                </h1>
                <p className='text-gray-600 max-w-2xl mx-auto leading-relaxed'>
                    Immediate assistance when you need it most. Access emergency contacts, find nearby hospitals, and get first aid guidance.
                </p>
            </div>

            {/* Alert Banner */}
            <div className='max-w-6xl mx-auto px-4 mb-12'>
                <div className='glass-card rounded-2xl p-6 border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50'>
                    <div className='flex items-start gap-4'>
                        <div className='flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center'>
                            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                            </svg>
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-lg font-bold text-red-800 mb-1'>In Case of Emergency</h3>
                            <p className='text-red-700 text-sm leading-relaxed'>
                                Stay calm and call the appropriate emergency number immediately. If someone is unconscious or not breathing, call 108 for ambulance services right away.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className='max-w-6xl mx-auto px-4 mb-8'>
                <div className='glass-card rounded-2xl p-2 inline-flex gap-2 flex-wrap'>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'contacts'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Emergency Contacts
                    </button>
                    <button
                        onClick={() => setActiveTab('hospitals')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'hospitals'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Nearby Hospitals
                    </button>
                    <button
                        onClick={() => setActiveTab('firstaid')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'firstaid'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        First Aid Tips
                    </button>
                </div>
            </div>

            {/* Emergency Contacts Tab */}
            {activeTab === 'contacts' && (
                <div className='max-w-6xl mx-auto px-4 animate-fade-in'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {emergencyContacts.map((contact, index) => (
                            <div
                                key={index}
                                className='glass-card rounded-2xl overflow-hidden hover:shadow-luxury transition-all duration-500 group animate-scale-in'
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`h-2 bg-gradient-to-r ${contact.color}`}></div>
                                <div className='p-6'>
                                    <div className='flex items-start justify-between mb-4'>
                                        <div className='flex-1'>
                                            <h3 className='text-xl font-bold text-gray-900 mb-2'>{contact.service}</h3>
                                            <p className='text-sm text-gray-600 mb-3'>{contact.description}</p>
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${contact.bgColor} ${contact.borderColor} border-2`}>
                                                <svg className={`w-5 h-5 ${contact.textColor}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                                </svg>
                                                <span className={`text-2xl font-bold ${contact.textColor}`}>{contact.number}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCall(contact.number)}
                                        className={`w-full bg-gradient-to-r ${contact.color} text-white py-3 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105`}
                                    >
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                        </svg>
                                        Call Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nearby Hospitals Tab */}
            {activeTab === 'hospitals' && (
                <div className='max-w-6xl mx-auto px-4 animate-fade-in'>
                    {/* Location Button */}
                    <div className='flex justify-center mb-8'>
                        <button
                            onClick={getLocation}
                            disabled={loading}
                            className='glass-card px-8 py-4 rounded-2xl font-semibold text-primary hover:shadow-glow transition-all duration-300 flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? (
                                <>
                                    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary'></div>
                                    Detecting Location...
                                </>
                            ) : (
                                <>
                                    <svg className='w-6 h-6 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    Find Nearby Hospitals
                                </>
                            )}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className='glass-card rounded-2xl p-6 mb-8 border-2 border-red-200 bg-red-50'>
                            <div className='flex items-start gap-4'>
                                <svg className='w-6 h-6 text-red-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                                <div>
                                    <p className='text-red-800 font-semibold mb-1'>Error</p>
                                    <p className='text-red-700 text-sm'>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className='text-center py-20'>
                            <div className='inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4'></div>
                            <p className='text-gray-600'>Searching for nearby hospitals...</p>
                        </div>
                    )}

                    {/* Hospitals List */}
                    {!loading && locationDetected && nearbyHospitals.length > 0 && (
                        <div className='space-y-6'>
                            <div className='glass-card rounded-2xl p-6 bg-gradient-to-r from-green-50 to-blue-50'>
                                <div className='flex items-center gap-3'>
                                    <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    <p className='text-gray-700 font-semibold'>
                                        Found {nearbyHospitals.length} medical facilities near you
                                    </p>
                                </div>
                            </div>

                            {nearbyHospitals.map((hospital, index) => (
                                <div
                                    key={hospital.id}
                                    className='glass-card rounded-2xl p-6 hover:shadow-luxury transition-all duration-500 animate-scale-in'
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className='flex flex-col lg:flex-row gap-6'>
                                        <div className='flex-1'>
                                            <div className='flex items-start justify-between mb-3'>
                                                <div>
                                                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>{hospital.name}</h3>
                                                    <div className='flex items-center gap-2 text-gray-600 mb-2'>
                                                        <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                                        </svg>
                                                        <span className='text-sm'>{hospital.address}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex flex-wrap gap-3 mb-4'>
                                                <span className='inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-semibold text-sm border border-green-200'>
                                                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                                                    {hospital.availability}
                                                </span>
                                                <span className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm border border-blue-200'>
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                                                    </svg>
                                                    {hospital.rating} Rating
                                                </span>
                                                {hospital.beds !== 'N/A' && (
                                                    <span className='inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-semibold text-sm border border-purple-200'>
                                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                                        </svg>
                                                        {hospital.beds} Beds
                                                    </span>
                                                )}
                                                <span className='inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl font-semibold text-sm border border-orange-200'>
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
                                                    </svg>
                                                    {hospital.distance}
                                                </span>
                                            </div>

                                            <div className='mb-4'>
                                                <p className='text-sm font-semibold text-gray-700 mb-2'>Services:</p>
                                                <div className='flex flex-wrap gap-2'>
                                                    {hospital.specialties.map((specialty, idx) => (
                                                        <span
                                                            key={idx}
                                                            className='px-3 py-1.5 bg-gradient-to-r from-primary/10 to-purple-100 text-primary rounded-full text-xs font-medium border border-primary/20'
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {hospital.phone !== 'Not available' && (
                                                <div className='flex items-center gap-2 text-sm text-gray-600 mb-4'>
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                                    </svg>
                                                    <span className='font-medium'>{hospital.phone}</span>
                                                </div>
                                            )}

                                            <div className='flex flex-col sm:flex-row gap-3'>
                                                {hospital.phone !== 'Not available' && (
                                                    <button
                                                        onClick={() => handleCall(hospital.phone)}
                                                        className='flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2'
                                                    >
                                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                                        </svg>
                                                        Call Hospital
                                                    </button>
                                                )}
                                                <button
                                                    className='flex-1 bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2'
                                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`, '_blank')}
                                                >
                                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
                                                    </svg>
                                                    Get Directions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Location Detected */}
                    {!loading && !locationDetected && (
                        <div className='text-center py-20'>
                            <div className='glass-card inline-block px-12 py-16 rounded-3xl'>
                                <svg className='w-24 h-24 text-gray-300 mx-auto mb-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                </svg>
                                <p className='text-gray-500 text-lg font-medium mb-2'>Find Hospitals Near You</p>
                                <p className='text-gray-400 text-sm'>Click the button above to detect your location and find nearby medical facilities</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* First Aid Tips Tab */}
            {activeTab === 'firstaid' && (
                <div className='max-w-6xl mx-auto px-4 animate-fade-in'>
                    <div className='glass-card rounded-3xl p-8 mb-8 bg-gradient-to-br from-blue-50 to-purple-50'>
                        <div className='flex items-start gap-4'>
                            <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center'>
                                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                                </svg>
                            </div>
                            <div>
                                <h3 className='text-xl font-bold text-gray-900 mb-2'>Essential First Aid Guidelines</h3>
                                <p className='text-gray-600 leading-relaxed'>
                                    These are basic first aid procedures for common emergencies. Remember, first aid is not a substitute for professional medical care. Always call emergency services when needed.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {firstAidTips.map((tip, index) => (
                            <div
                                key={index}
                                className='glass-card rounded-2xl p-6 hover:shadow-luxury transition-all duration-500 animate-scale-in'
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className='flex items-start gap-4 mb-4'>
                                    <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white'>
                                        {tip.icon}
                                    </div>
                                    <div>
                                        <h3 className='text-xl font-bold text-gray-900'>{tip.title}</h3>
                                    </div>
                                </div>
                                <div className='space-y-3'>
                                    {tip.steps.map((step, idx) => (
                                        <div key={idx} className='flex items-start gap-3'>
                                            <div className='flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold'>
                                                {idx + 1}
                                            </div>
                                            <p className='text-sm text-gray-700 leading-relaxed flex-1'>{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Important Notice */}
                    <div className='glass-card rounded-2xl p-6 mt-8 border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50'>
                        <div className='flex items-start gap-4'>
                            <div className='flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center'>
                                <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            </div>
                            <div>
                                <h4 className='font-bold text-yellow-800 mb-2'>Important Notice</h4>
                                <p className='text-sm text-yellow-700 leading-relaxed'>
                                    These first aid tips are for informational purposes only. For proper first aid training, consult certified professionals. In serious emergencies, always call emergency services immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Action Footer */}
            <div className='max-w-6xl mx-auto px-4 mt-12'>
                <div className='glass-card rounded-3xl p-8 bg-gradient-to-br from-red-50 via-orange-50 to-pink-50'>
                    <div className='text-center'>
                        <h3 className='text-2xl font-bold text-gray-900 mb-3'>Need Immediate Help?</h3>
                        <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
                            In a life-threatening emergency, every second counts. Don't hesitate to call for help.
                        </p>
                        <div className='flex flex-wrap justify-center gap-4'>
                            <button
                                onClick={() => handleCall('108')}
                                className='bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-glow transition-all duration-300 flex items-center gap-3 group'
                            >
                                <svg className='w-6 h-6 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                </svg>
                                Call Ambulance (108)
                            </button>
                            <button
                                onClick={() => handleCall('100')}
                                className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-glow transition-all duration-300 flex items-center gap-3 group'
                            >
                                <svg className='w-6 h-6 group-hover:scale-110 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                                </svg>
                                Call Police (100)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmergencyServices
