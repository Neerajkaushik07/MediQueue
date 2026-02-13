import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { specialities } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaUserMd, FaUser } from 'react-icons/fa'

const Login = () => {
  const { backendUrl, token, setToken, userRole, setUserRole } = useContext(AppContext)
  const [state, setState] = useState('Sign Up')
  const [role, setRole] = useState('patient') // 'patient' or 'doctor'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Doctor-specific fields
  const [speciality, setSpeciality] = useState('')
  const [degree, setDegree] = useState('')
  const [experience, setExperience] = useState('')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [address, setAddress] = useState({ line1: '', line2: '' })

  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === 'Sign Up') {
        if (role === 'doctor') {
          // Doctor registration
          const { data } = await axios.post(backendUrl + '/api/doctor/register', {
            name, email, password, speciality, degree, experience, fees, about,
            address: JSON.stringify(address)
          })

          if (data.success) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('userRole', 'doctor')
            setToken(data.token)
            setUserRole('doctor')
            toast.success('Doctor registered successfully!')
          } else {
            toast.error(data.message)
          }
        } else {
          // Patient registration
          const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

          if (data.success) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('userRole', 'patient')
            setToken(data.token)
            setUserRole('patient')
            toast.success('Account created successfully!')
          } else {
            toast.error(data.message)
          }
        }
      } else {
        // Login
        const endpoint = role === 'doctor' ? '/api/doctor/login' : '/api/user/login'
        const { data } = await axios.post(backendUrl + endpoint, { email, password })

        if (data.success) {
          if (rememberMe) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('userRole', role)
          } else {
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('userRole', role)
          }
          setToken(data.token)
          setUserRole(role)
          toast.success(`Welcome back!`)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  useEffect(() => {
    if (token && userRole) {
      if (userRole === 'doctor') {
        navigate('/doctor-dashboard')
      } else {
        navigate('/')
      }
    }
  }, [token, userRole, navigate])

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-12 relative overflow-hidden'>
      <form onSubmit={onSubmitHandler} className='relative w-full max-w-2xl mx-4 animate-scale-in'>
        <div className='glass-card p-10 rounded-3xl shadow-luxury'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='inline-block mb-4'>
              <span className='inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-primary text-sm font-semibold shadow-lg'>
                {state === 'Sign Up' ? '🎉 Join Us' : '👋 Welcome Back'}
              </span>
            </div>
            <h2 className='text-3xl font-bold luxury-heading mb-2'>
              {state === 'Sign Up' ? 'Create Account' : 'Login'}
            </h2>
            <p className='text-gray-600'>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to continue</p>
          </div>

          {/* Role Selection */}
          <div className='mb-6'>
            <label className='text-sm font-medium text-gray-700 mb-3 block'>I am a:</label>
            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => setRole('patient')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${role === 'patient'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary/50'
                  }`}
              >
                <FaUser size={24} />
                <span className='font-semibold'>Patient</span>
              </button>
              <button
                type='button'
                onClick={() => setRole('doctor')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${role === 'doctor'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary/50'
                  }`}
              >
                <FaUserMd size={24} />
                <span className='font-semibold'>Doctor</span>
              </button>
            </div>
          </div>

          {/* Google Login (Only for patients) - Temporarily disabled */}
          {/* {role === 'patient' && (
            <>
              <div className='space-y-3 mb-6'>
                <div className='flex justify-center'>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text={state === 'Sign Up' ? 'signup_with' : 'signin_with'}
                    width="100%"
                  />
                </div>
              </div>

              <div className='flex items-center gap-3 my-6'>
                <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
                <span className='text-sm text-gray-500 font-medium'>OR</span>
                <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
              </div>
            </>
          )} */}

          {/* Form Fields */}
          <div className='flex flex-col gap-5'>
            {state === 'Sign Up' && (
              <div className='w-full animate-slide-down'>
                <label className='text-sm font-medium text-gray-700 mb-2 block'>Full Name</label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div className='w-full'>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className='w-full'>
              <div className='flex justify-between items-center mb-2'>
                <label className='text-sm font-medium text-gray-700'>Password</label>
                {state === 'Login' && (
                  <a href='#' className='text-xs text-primary hover:text-purple-600 font-medium transition-colors'>
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className='relative'>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className='glass border-0 rounded-xl w-full p-3 pr-12 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors mt-0.5'
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {state === 'Sign Up' && role === 'doctor' && (
              <>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-2 block'>Speciality</label>
                    <select
                      onChange={(e) => setSpeciality(e.target.value)}
                      value={speciality}
                      className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                      required
                    >
                      <option value="">Select Speciality</option>
                      {specialities.map((spec, index) => (
                        <option key={index} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-2 block'>Degree</label>
                    <input
                      onChange={(e) => setDegree(e.target.value)}
                      value={degree}
                      className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                      type="text"
                      placeholder="e.g., MBBS, MD"
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-2 block'>Experience (years)</label>
                    <input
                      onChange={(e) => setExperience(e.target.value)}
                      value={experience}
                      className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                      type="text"
                      placeholder="e.g., 5 Years"
                      required
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-2 block'>Consultation Fee (₹)</label>
                    <input
                      onChange={(e) => setFees(e.target.value)}
                      value={fees}
                      className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                      type="number"
                      placeholder="e.g., 500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>Address Line 1</label>
                  <input
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    value={address.line1}
                    className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                    type="text"
                    placeholder="Clinic address"
                    required
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>Address Line 2</label>
                  <input
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    value={address.line2}
                    className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                    type="text"
                    placeholder="City, State"
                    required
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>About</label>
                  <textarea
                    onChange={(e) => setAbout(e.target.value)}
                    value={about}
                    className='glass border-0 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
                    rows="3"
                    placeholder="Brief description about yourself and your practice"
                  />
                </div>
              </>
            )}

            {/* Remember Me & Terms */}
            {state === 'Login' ? (
              <div className='flex items-center'>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer'
                />
                <label htmlFor="rememberMe" className='ml-2 text-sm text-gray-600 cursor-pointer'>
                  Remember me
                </label>
              </div>
            ) : (
              <div className='text-xs text-gray-600'>
                By signing up, you agree to our{' '}
                <a href='#' className='text-primary hover:underline font-medium'>Terms of Service</a>
                {' '}and{' '}
                <a href='#' className='text-primary hover:underline font-medium'>Privacy Policy</a>
              </div>
            )}

            <button
              type='submit'
              className='bg-gradient-to-r from-primary to-purple-600 text-white w-full py-3.5 my-3 rounded-xl text-base font-medium hover:shadow-glow transition-all duration-300 hover:scale-105 btn-glow'
            >
              {state === 'Sign Up' ? 'Create Account' : 'Login'}
            </button>

            <div className='text-center text-sm text-gray-600'>
              {state === 'Sign Up'
                ? (
                  <p>
                    Already have an account?{' '}
                    <span onClick={() => setState('Login')} className='text-primary font-semibold underline cursor-pointer hover:text-purple-600 transition-colors'>
                      Login here
                    </span>
                  </p>
                )
                : (
                  <p>
                    Create a new account?{' '}
                    <span onClick={() => setState('Sign Up')} className='text-primary font-semibold underline cursor-pointer hover:text-purple-600 transition-colors'>
                      Click here
                    </span>
                  </p>
                )
              }
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
