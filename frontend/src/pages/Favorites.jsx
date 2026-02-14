import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Favorites = () => {
  const [favoriteDoctors, setFavoriteDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { backendUrl, token, isDemoMode } = useContext(AppContext)

  const getFavoriteDoctors = useCallback(async () => {
    if (isDemoMode) {
      // Mock data for demo
      setFavoriteDoctors([
        {
          _id: 'doc1',
          name: 'Dr. Richard James',
          image: assets.doc1,
          speciality: 'General Physician',
          degree: 'MBBS',
          experience: '4 Years',
          about: 'Dr. Richard James has a strong commitment to delivering comprehensive medical care.',
          fees: 50,
          address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
          },
          available: true,
          rating: 4.5,
          totalReviews: 12
        },
        {
          _id: 'doc2',
          name: 'Dr. Emily Larson',
          image: assets.doc2,
          speciality: 'Gynecologist',
          degree: 'MBBS',
          experience: '3 Years',
          about: 'Dr. Emily Larson is a dedicated gynecologist with a focus on women\'s health.',
          fees: 60,
          address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
          },
          available: true,
          rating: 4.8,
          totalReviews: 24
        }
      ])
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get(backendUrl + '/api/user/favorite-doctors', { headers: { token } })
      if (data.success) {
        setFavoriteDoctors(data.favoriteDoctors)
      } else {
        toast.error(data.message)
      }
    } catch (error) {

      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token])

  const removeFavorite = async (doctorId) => {
    if (isDemoMode) {
      toast.info('Changes cannot be saved in Demo Mode')
      return
    }
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/toggle-favorite',
        { doctorId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Removed from favorites')
        getFavoriteDoctors()
      } else {
        toast.error(data.message)
      }
    } catch (error) {

      toast.error(error.message)
    }
  }

  useEffect(() => {
    getFavoriteDoctors()
  }, [getFavoriteDoctors])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <p className='text-gray-500'>Loading your favorites...</p>
      </div>
    )
  }

  return (
    <div>
      <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My Favorite Doctors</p>

      {favoriteDoctors.length > 0 ? (
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6 pt-5'>
          {favoriteDoctors.map((doctor, index) => (
            <div key={index} className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 relative'>
              {/* Remove Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFavorite(doctor._id)
                }}
                className='absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform'
              >
                <svg className='w-5 h-5 text-red-500 fill-current' viewBox='0 0 24 24'>
                  <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                </svg>
              </button>

              <div onClick={() => { navigate(`/appointment/${doctor._id}`); scrollTo(0, 0) }}>
                <img className='bg-[#EAEFFF]' src={doctor.image} alt="" />
                <div className='p-4'>
                  <div className={`flex items-center gap-2 text-sm text-center ${doctor.available ? 'text-green-500' : "text-gray-500"}`}>
                    <p className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : "bg-gray-500"}`}></p>
                    <p>{doctor.available ? 'Available' : "Not Available"}</p>
                  </div>
                  <p className='text-[#262626] text-lg font-medium'>{doctor.name}</p>
                  <p className='text-[#5C5C5C] text-sm'>{doctor.speciality}</p>
                  <div className='flex items-center gap-2 mt-2'>
                    {doctor.rating > 0 ? (
                      <>
                        <span className='text-yellow-500'>★</span>
                        <span className='text-gray-700 font-medium'>{doctor.rating}</span>
                        <span className='text-gray-500 text-xs'>({doctor.totalReviews} reviews)</span>
                      </>
                    ) : (
                      <span className='text-gray-400 text-xs'>No reviews yet</span>
                    )}
                  </div>
                  <p className='text-gray-600 text-sm mt-2'>Fees: ${doctor.fees}</p>
                  <p className='text-gray-500 text-xs'>{doctor.experience} experience</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-20'>
          <svg className='w-20 h-20 text-gray-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
          </svg>
          <p className='text-gray-500 text-lg mb-4'>No favorite doctors yet</p>
          <button
            onClick={() => navigate('/doctors')}
            className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all'
          >
            Browse Doctors
          </button>
        </div>
      )}
    </div>
  )
}

export default Favorites
