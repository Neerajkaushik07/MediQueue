import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AddDoctor from './pages/AddDoctor'

import DoctorLogin from './pages/Doctor/DoctorLogin'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorSchedule from './pages/Doctor/DoctorSchedule'
import DoctorPatients from './pages/Doctor/DoctorPatients'
import DoctorFinances from './pages/Doctor/DoctorFinances'
import DoctorReviews from './pages/Doctor/DoctorReviews'

import AboutContact from './pages/AboutContact'
import MyProfile from './pages/MyProfile'
import MyAppointment from './pages/MyAppointment'
import Appointment from './pages/Appointment'
import Favorites from './pages/Favorites'
import HealthBlog from './pages/HealthBlog'
import EmergencyServices from './pages/EmergencyServices'
import HealthTips from './pages/HealthTips'
import MedicalRecords from './pages/MedicalRecords'
import Medications from './pages/Medications'
import HealthMetrics from './pages/HealthMetrics'
import HealthProfile from './pages/HealthProfile'
import LabReports from './pages/LabReports'
import PatientDashboard from './pages/PatientDashboard'
import HealthDashboard from './pages/HealthDashboard'
import HealthFeatures from './pages/HealthFeatures'
import FamilyHealth from './pages/FamilyHealth'
import InsuranceMarketplace from './pages/InsuranceMarketplace'
import Telemedicine from './pages/Telemedicine'
import Community from './pages/Community'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import DemoAccess from './components/DemoAccess'
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
      <div className='mx-4 sm:mx-[10%] relative z-10'>
        <Navbar />
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
