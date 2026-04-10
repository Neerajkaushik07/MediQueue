import React from 'react'
import { Route, Routes } from 'react-router-dom'

// Auth Pages
import Login from './pages/Auth/Login'
import AdminLogin from './pages/Auth/AdminLogin'
import DoctorLogin from './pages/Auth/DoctorLogin'

// Public Pages
import Home from './pages/General/Home'
import Doctors from './pages/General/Doctors'
import AboutContact from './pages/General/AboutContact'
import HealthFeatures from './pages/General/HealthFeatures'
import HealthBlog from './pages/General/HealthBlog'
import EmergencyServices from './pages/General/EmergencyServices'
import HealthTips from './pages/General/HealthTips'
import Community from './pages/General/Community'

// Patient Pages
import MyProfile from './pages/Patient/MyProfile'
import MyAppointment from './pages/Patient/MyAppointment'
import Favorites from './pages/Patient/Favorites'
import MedicalRecords from './pages/Patient/MedicalRecords'
import Medications from './pages/Patient/Medications'
import HealthMetrics from './pages/Patient/HealthMetrics'
import HealthProfile from './pages/Patient/HealthProfile'
import LabReports from './pages/Patient/LabReports'
import PatientDashboard from './pages/Patient/PatientDashboard'
import HealthDashboard from './pages/Patient/HealthDashboard'
import FamilyHealth from './pages/Patient/FamilyHealth'

// Feature Pages
import Appointment from './pages/Features/Appointment'
import InsuranceMarketplace from './pages/Features/InsuranceMarketplace'
import Telemedicine from './pages/Features/Telemedicine'

// Doctor Pages
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorSchedule from './pages/Doctor/DoctorSchedule'
import DoctorPatients from './pages/Doctor/DoctorPatients'
import DoctorFinances from './pages/Doctor/DoctorFinances'
import DoctorReviews from './pages/Doctor/DoctorReviews'

// Admin Pages
import AddDoctor from './pages/Admin/AddDoctor'

// Layout Components
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'

// Auth Components
import ProtectedRoute from './components/Auth/ProtectedRoute'
import DemoAccess from './components/Auth/DemoAccess'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='relative min-h-screen'>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="glass-card"
      />
      <Navbar />
      <div className='mx-4 sm:mx-[10%] relative z-10'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<AboutContact />} />
          <Route path='/features' element={<HealthFeatures />} />
          <Route path='/health-blog' element={<HealthBlog />} />
          <Route path='/emergency' element={<EmergencyServices />} />
          <Route path='/health-tips' element={<HealthTips />} />

          {/* Protected Routes */}
          <Route path='/my-profile' element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path='/my-appointments' element={<ProtectedRoute><MyAppointment /></ProtectedRoute>} />
          <Route path='/my-favorites' element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path='/appointment/:docId' element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
          <Route path='/medical-records' element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
          <Route path='/medications' element={<ProtectedRoute><Medications /></ProtectedRoute>} />
          <Route path='/health-metrics' element={<ProtectedRoute><HealthMetrics /></ProtectedRoute>} />
          <Route path='/health-profile' element={<ProtectedRoute><HealthProfile /></ProtectedRoute>} />
          <Route path='/lab-reports' element={<ProtectedRoute><LabReports /></ProtectedRoute>} />
          <Route path='/patient-dashboard' element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
          <Route path='/health-dashboard' element={<ProtectedRoute><HealthDashboard /></ProtectedRoute>} />
          <Route path='/family-health' element={<ProtectedRoute><FamilyHealth /></ProtectedRoute>} />
          <Route path='/insurance-marketplace' element={<ProtectedRoute><InsuranceMarketplace /></ProtectedRoute>} />
          <Route path='/teleconsultation' element={<ProtectedRoute><Telemedicine /></ProtectedRoute>} />
          <Route path='/community' element={<ProtectedRoute><Community /></ProtectedRoute>} />

          <Route path='/doctor/login' element={<DoctorLogin />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-schedule' element={<DoctorSchedule />} />
          <Route path='/doctor-patients' element={<DoctorPatients />} />
          <Route path='/doctor-finances' element={<DoctorFinances />} />
          <Route path='/doctor-reviews' element={<DoctorReviews />} />

          <Route path='/admin-login' element={<AdminLogin />} />
          <Route path='/add-doctor' element={<AddDoctor />} />

        </Routes>
      </div>
      <DemoAccess />
      <Footer />
    </div>
  )
}

export default App
