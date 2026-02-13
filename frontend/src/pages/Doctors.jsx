import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {
    const { speciality } = useParams()
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    // State management
    const [filterDoc, setFilterDoc] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialities, setSelectedSpecialities] = useState([])
    const [sortBy, setSortBy] = useState('experience-high')
    const [isLoading, setIsLoading] = useState(true)
    const [openDropdown, setOpenDropdown] = useState(null)

    // Refs for click outside detection
    const dropdownRef = useRef(null)

    // Available specialities
    const specialities = [
        'General physician',
        'Gynecologist',
        'Dermatologist',
        'Pediatricians',
        'Neurologist',
        'Gastroenterologist'
    ]

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Apply all filters
    const applyFilters = useCallback(() => {
        let filtered = [...doctors]

        // Filter by URL speciality parameter or selected specialities
        if (speciality) {
            filtered = filtered.filter(doc => doc.speciality === speciality)
        } else if (selectedSpecialities.length > 0) {
            filtered = filtered.filter(doc => selectedSpecialities.includes(doc.speciality))
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.speciality.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Sort results
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'experience-high': {
                    // Extract numeric value from experience string (e.g., "5 Years" -> 5)
                    const expAHigh = parseInt(a.experience) || 0
                    const expBHigh = parseInt(b.experience) || 0
                    return expBHigh - expAHigh // High to low
                }
                case 'experience-low': {
                    const expALow = parseInt(a.experience) || 0
                    const expBLow = parseInt(b.experience) || 0
                    return expALow - expBLow // Low to high
                }
                case 'fee-low':
                    return a.fees - b.fees // Low to high
                case 'fee-high':
                    return b.fees - a.fees // High to low
                default:
                    return 0
            }
        })

        setFilterDoc(filtered)
    }, [doctors, speciality, selectedSpecialities, searchQuery, sortBy])

    // Handle speciality selection
    const toggleSpeciality = (spec) => {
        if (speciality) {
            navigate('/doctors')
            setSelectedSpecialities([spec])
        } else {
            setSelectedSpecialities(prev =>
                prev.includes(spec)
                    ? prev.filter(s => s !== spec)
                    : [...prev, spec]
            )
        }
    }

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('')
        setSelectedSpecialities([])
        setSortBy('experience-high')
        if (speciality) {
            navigate('/doctors')
        }
    }

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0
        if (searchQuery.trim()) count++
        if (speciality || selectedSpecialities.length > 0) count++
        return count
    }

    // Apply filters when dependencies change
    useEffect(() => {
        setIsLoading(true)
        applyFilters()
        setTimeout(() => setIsLoading(false), 300)
    }, [applyFilters])

    // Toggle dropdown
    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
    }

    // Render doctor card
    const DoctorCard = ({ doctor }) => (
        <div
            onClick={() => navigate(`/appointment/${doctor._id}`)}
            className="doctor-card-enhanced animate-fade-in-up"
        >
            <div className="doctor-image-wrapper">
                <img
                    className="doctor-image"
                    src={doctor.image}
                    alt={doctor.name}
                />
                <div className="status-badge available">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Available
                </div>
            </div>
            <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.speciality}</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="badge-specialty">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        {doctor.degree}
                    </span>
                    {doctor.experience && (
                        <span className="badge-experience">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {doctor.experience}
                        </span>
                    )}
                </div>

                {doctor.fees && (
                    <div className="fee-display">
                        <span className="fee-label">Consultation Fee</span>
                        <span className="fee-amount">₹{doctor.fees}</span>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <div className="px-4 sm:px-6 lg:px-10 py-8">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title gradient-text">Find Your Doctor</h1>
                <p className="page-subtitle">
                    Browse through our specialist doctors and book your appointment
                </p>
            </div>

            {/* Horizontal Filter Bar */}
            <div className="filter-bar" ref={dropdownRef}>
                {/* Search Input */}
                <div className="search-input-wrapper">
                    <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search doctors by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Speciality Filter Dropdown */}
                <div className="filter-item">
                    <button
                        onClick={() => toggleDropdown('speciality')}
                        className={`filter-trigger ${(speciality || selectedSpecialities.length > 0) ? 'active' : ''
                            } ${openDropdown === 'speciality' ? 'open' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        <span>
                            Speciality
                            {(speciality || selectedSpecialities.length > 0) && (
                                <span className="ml-1 text-xs">
                                    ({speciality ? 1 : selectedSpecialities.length})
                                </span>
                            )}
                        </span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openDropdown === 'speciality' && (
                        <div className="filter-dropdown">
                            {specialities.map((spec) => (
                                <div
                                    key={spec}
                                    onClick={() => toggleSpeciality(spec)}
                                    className={`filter-dropdown-item ${speciality === spec || selectedSpecialities.includes(spec)
                                        ? 'selected'
                                        : ''
                                        }`}
                                >
                                    <span>{spec}</span>
                                    {(speciality === spec || selectedSpecialities.includes(spec)) && (
                                        <svg className="checkmark" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="filter-item">
                    <button
                        onClick={() => toggleDropdown('sort')}
                        className={`filter-trigger ${openDropdown === 'sort' ? 'open' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        <span>Sort</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {openDropdown === 'sort' && (
                        <div className="filter-dropdown">
                            <div
                                onClick={() => {
                                    setSortBy('experience-high')
                                    setOpenDropdown(null)
                                }}
                                className={`filter-dropdown-item ${sortBy === 'experience-high' ? 'selected' : ''}`}
                            >
                                <span>Experience (High to Low)</span>
                                {sortBy === 'experience-high' && (
                                    <svg className="checkmark" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div
                                onClick={() => {
                                    setSortBy('experience-low')
                                    setOpenDropdown(null)
                                }}
                                className={`filter-dropdown-item ${sortBy === 'experience-low' ? 'selected' : ''}`}
                            >
                                <span>Experience (Low to High)</span>
                                {sortBy === 'experience-low' && (
                                    <svg className="checkmark" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div
                                onClick={() => {
                                    setSortBy('fee-low')
                                    setOpenDropdown(null)
                                }}
                                className={`filter-dropdown-item ${sortBy === 'fee-low' ? 'selected' : ''}`}
                            >
                                <span>Fee (Low to High)</span>
                                {sortBy === 'fee-low' && (
                                    <svg className="checkmark" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div
                                onClick={() => {
                                    setSortBy('fee-high')
                                    setOpenDropdown(null)
                                }}
                                className={`filter-dropdown-item ${sortBy === 'fee-high' ? 'selected' : ''}`}
                            >
                                <span>Fee (High to Low)</span>
                                {sortBy === 'fee-high' && (
                                    <svg className="checkmark" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Clear Filters Button */}
                {getActiveFilterCount() > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="filter-trigger hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Clear Filters</span>
                    </button>
                )}

                {/* Results Count */}
                <div className="ml-auto text-sm text-gray-600 font-medium">
                    <span className="text-primary font-bold">{filterDoc.length}</span> {filterDoc.length === 1 ? 'doctor' : 'doctors'}
                </div>
            </div>

            {/* Doctors Grid */}
            <div>
                {isLoading ? (
                    // Loading Skeletons
                    <div className="doctors-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="doctor-card-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                    <div className="skeleton-line short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filterDoc.length > 0 ? (
                    // Doctor Cards
                    <div className="doctors-grid">
                        {filterDoc.map((doctor) => (
                            <DoctorCard key={doctor._id} doctor={doctor} />
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3 className="empty-state-title">No Doctors Found</h3>
                        <p className="empty-state-description">
                            We couldn't find any doctors matching your criteria. Try adjusting your filters or search query.
                        </p>
                        {getActiveFilterCount() > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="btn-primary mt-6"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Doctors
