import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import DoctorCard from '../../components/Shared/DoctorCard'

const Doctors = () => {
    const { speciality } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { doctors } = useContext(AppContext)

    // State management
    const [filterDoc, setFilterDoc] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSpecialities, setSelectedSpecialities] = useState([])
    const [sortBy, setSortBy] = useState('experience-high')
    const [showAvailableOnly, setShowAvailableOnly] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [openDropdown, setOpenDropdown] = useState(null)
    const itemsPerPage = 8

    // Parse search from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query) {
            setSearchQuery(query);
        }
    }, [location.search]);

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

        // Filter by availability
        if (showAvailableOnly) {
            filtered = filtered.filter(doc => doc.available)
        }

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
                case 'rating-high': // New sorting option
                    return (b.rating || 0) - (a.rating || 0)
                case 'fee-low':
                    return a.fees - b.fees // Low to high
                case 'fee-high':
                    return b.fees - a.fees // High to low
                default:
                    return 0
            }
        })

        setFilterDoc(filtered)
        setCurrentPage(1)
    }, [doctors, speciality, selectedSpecialities, searchQuery, sortBy, showAvailableOnly])

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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentDoctors = filterDoc.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filterDoc.length / itemsPerPage)

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="px-4 sm:px-6 lg:px-10 pt-8 pb-20">
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

                {/* Available Only Toggle */}
                <div className="filter-item mr-2 hidden sm:block">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={showAvailableOnly}
                                onChange={() => setShowAvailableOnly(!showAvailableOnly)}
                            />
                            <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${showAvailableOnly ? 'bg-primary' : 'bg-gray-200'}`}></div>
                            <div className={`absolute top-1 left-1 bg-white dark:bg-gray-800 w-4 h-4 rounded-full shadow transition-transform ${showAvailableOnly ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Available Only</span>
                    </label>
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
                <div className="ml-auto text-sm text-gray-600 dark:text-gray-300 font-medium">
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
                    <>
                        <div className="doctors-grid">
                            {currentDoctors.map((doctor) => (
                                <DoctorCard key={doctor._id} doctor={doctor} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 gap-4">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full border ${currentPage === 1
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full border ${currentPage === totalPages
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
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
