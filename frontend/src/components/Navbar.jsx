import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken, userData, userRole, setUserRole } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userRole')
    setToken(null)
    setUserRole(null)
    navigate('/')
  }

  return (
    <div className='medical-card sticky top-0 z-50 flex items-center justify-between text-sm py-4 px-6 mb-5 shadow-medical backdrop-blur-sm bg-white/95'>
      <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105 duration-300" onClick={() => navigate('/')}>
        <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-900">
            MediQueue
          </span>
          <span className="text-xs text-primary font-medium">Healthcare Excellence</span>
        </div>
      </div>

      <ul className='hidden md:flex items-center gap-6 font-medium'>
        {userRole !== 'doctor' && (
          <li>
            <NavLink
              to='/'
              className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
            >
              <span className="relative text-sm">
                Home
                {location.pathname === '/' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
              </span>
            </NavLink>
          </li>
        )}
        {userRole !== 'doctor' && (
          <li>
            <NavLink
              to='/doctors'
              className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
            >
              <span className="relative text-sm">
                All Doctors
                {location.pathname.includes('/doctors') && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
              </span>
            </NavLink>
          </li>
        )}
        {userRole !== 'doctor' && (
          <li>
            <NavLink
              to='/features'
              className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
            >
              <span className="relative text-sm">
                Health Dashboard
                {location.pathname === '/features' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
              </span>
            </NavLink>
          </li>
        )}
        {userRole !== 'doctor' && (
          <li>
            <NavLink
              to='/community'
              className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
            >
              <span className="relative text-sm">
                Community
                {location.pathname === '/community' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
              </span>
            </NavLink>
          </li>
        )}


        {userRole === 'doctor' && (
          <>
            <li>
              <NavLink
                to='/doctor-dashboard'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Dashboard
                  {location.pathname === '/doctor-dashboard' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/doctor-appointments'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Appointments
                  {location.pathname === '/doctor-appointments' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/doctor-schedule'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Schedule
                  {location.pathname === '/doctor-schedule' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/doctor-patients'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Patients
                  {location.pathname === '/doctor-patients' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/doctor-finances'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Finances
                  {location.pathname === '/doctor-finances' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/doctor-reviews'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Reviews
                  {location.pathname === '/doctor-reviews' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
          </>
        )}
        {userRole !== 'doctor' && (
          <>
            <li>
              <NavLink
                to='/health-blog'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  Health Blog
                  {location.pathname === '/health-blog' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/emergency'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-red-600'}`}
              >
                <span className="relative text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Emergency
                  {location.pathname === '/emergency' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-red-600 rounded-full'></span>}
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/about'
                className={({ isActive }) => `relative py-2 transition-all duration-300 ${isActive ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}
              >
                <span className="relative text-sm">
                  About us
                  {location.pathname === '/about' && <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-primary rounded-full'></span>}
                </span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className='flex items-center gap-4'>
        {token ? (
          // Show profile dropdown when logged in
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-10 h-10 rounded-full border-2 border-primary/20 shadow-soft transition-all hover:border-primary duration-300' src={userData?.image || '/fallback-user.png'} alt="profile" />
            <svg className='w-4 h-4 text-gray-600 transition-transform group-hover:rotate-180 duration-300' fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            <div className='absolute top-0 right-0 pt-14 text-sm font-medium text-gray-700 z-20 hidden group-hover:block animate-fade-in'>
              <div className='min-w-48 bg-white rounded-xl flex flex-col gap-1 p-2 shadow-card border border-gray-100'>
                {userRole === 'patient' && (
                  <>
                    <p onClick={() => navigate('/patient-dashboard')} className='hover:text-primary hover:bg-calm-blue cursor-pointer px-4 py-2 rounded-lg transition-all duration-200'>My Dashboard</p>
                    <p onClick={() => navigate('my-profile')} className='hover:text-primary hover:bg-calm-blue cursor-pointer px-4 py-2 rounded-lg transition-all duration-200'>My Profile</p>
                    <p onClick={() => navigate('my-appointments')} className='hover:text-primary hover:bg-calm-blue cursor-pointer px-4 py-2 rounded-lg transition-all duration-200'>My Appointments</p>
                    <p onClick={() => navigate('my-favorites')} className='hover:text-primary hover:bg-calm-blue cursor-pointer px-4 py-2 rounded-lg transition-all duration-200'>My Favorites</p>
                  </>
                )}
                {userRole === 'doctor' && (
                  <>
                    <p onClick={() => navigate('/doctor-profile')} className='hover:text-primary hover:bg-calm-blue cursor-pointer px-4 py-2 rounded-lg transition-all duration-200'>My Profile</p>
                  </>
                )}

                <div className='h-px bg-gray-200 my-1'></div>
                <p onClick={logout} className='hover:text-red-600 hover:bg-red-50 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200'>Logout</p>
              </div>
            </div>
          </div>
        ) : (
          // Show login button when logged out
          <button
            onClick={() => navigate('/login')}
            className='bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-glow transition-all duration-300 hover:scale-105'
          >
            Create Account
          </button>
        )}
      </div>

      <img onClick={() => setShowMenu(true)} className='w-6 md:hidden cursor-pointer hover:scale-110 transition-transform duration-300' src={assets.menu_icon} alt="" />

      {/* ---- Mobile Menu ---- */}
      <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all duration-300`}>
        <div className='flex items-center justify-between px-5 py-6 border-b border-gray-200'>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">MediQueue</span>
          </div>
          <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7 cursor-pointer hover:rotate-90 transition-transform duration-300' alt="" />
        </div>
        <ul className='flex flex-col gap-2 mt-5 px-5 text-base font-medium'>


          {userRole === 'doctor' && (
            <div className='mt-2 mb-2'>
              <p className='px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide'>Professional Panel</p>
              <NavLink onClick={() => setShowMenu(false)} to='/doctor-dashboard' >
                <p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200 flex items-center gap-2'>
                  <span>📊</span>
                  Dashboard
                </p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctor-appointments' >
                <p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200 flex items-center gap-2'>
                  <span>📅</span>
                  Appointments
                </p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctor-schedule' >
                <p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200 flex items-center gap-2'>
                  <span>🕐</span>
                  Schedule
                </p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctor-patients' >
                <p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200 flex items-center gap-2'>
                  <span>👥</span>
                  Patients
                </p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctor-finances' >
                <p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200 flex items-center gap-2'>
                  <span>💰</span>
                  Finances
                </p>
              </NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/doctor-reviews' >
                <p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200 flex items-center gap-2'>
                  <span>⭐</span>
                  Reviews
                </p>
              </NavLink>
            </div>
          )}
          {userRole !== 'doctor' && (
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' ><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200'>All Doctors</p></NavLink>
          )}
          {userRole !== 'doctor' && (
            <NavLink onClick={() => setShowMenu(false)} to='/features' ><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200'>Health Dashboard</p></NavLink>
          )}
          {userRole !== 'doctor' && (
            <NavLink onClick={() => setShowMenu(false)} to='/community' ><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200'>Community</p></NavLink>
          )}





          {userRole !== 'doctor' && (
            <>
              <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200'>Home</p></NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/health-blog' ><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200'>Health Blog</p></NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/emergency' ><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-2'>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Emergency
              </p></NavLink>
              <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-5 py-3 rounded-lg text-gray-700 hover:bg-calm-blue hover:text-primary transition-all duration-200'>About us</p></NavLink>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Navbar
