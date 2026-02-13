import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa'

const AdminLogin = () => {
    const { backendUrl, token, setToken, setUserRole } = useContext(AppContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
            if (data.success) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('userRole', 'admin')
                setToken(data.token)
                setUserRole('admin')
                toast.success('Welcome back, Admin!')
                navigate('/add-doctor')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (token && localStorage.getItem('userRole') === 'admin') {
            navigate('/add-doctor')
        }
    }, [token, navigate])

    return (
        <div className='min-h-[80vh] flex items-center justify-center py-12 relative overflow-hidden'>
            <form onSubmit={onSubmitHandler} className='relative w-full max-w-md mx-4 animate-scale-in'>
                <div className='glass-card p-10 rounded-3xl shadow-luxury border border-primary/20'>
                    <div className='text-center mb-8'>
                        <div className='inline-block mb-4'>
                            <span className='inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-primary text-sm font-semibold shadow-lg'>
                                🛡️ Admin Portal
                            </span>
                        </div>
                        <h2 className='text-3xl font-bold luxury-heading mb-2'>Admin Login</h2>
                        <p className='text-gray-600 font-medium'>Exclusive access for administrators only</p>
                    </div>

                    <div className='flex flex-col gap-6'>
                        <div className='w-full'>
                            <label className='text-sm font-semibold text-gray-700 mb-2 block'>Admin Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className='glass border-0 rounded-xl w-full p-4 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800'
                                type="email"
                                placeholder="Enter admin email"
                                required
                            />
                        </div>

                        <div className='w-full'>
                            <div className='flex justify-between items-center mb-2'>
                                <label className='text-sm font-semibold text-gray-700'>Admin Password</label>
                            </div>
                            <div className='relative'>
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    className='glass border-0 rounded-xl w-full p-4 pr-12 mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-800'
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter admin password"
                                    required
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors mt-0.5'
                                >
                                    {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            className='bg-gradient-to-r from-primary to-purple-600 text-white w-full py-4 mt-4 rounded-xl text-lg font-bold hover:shadow-glow transition-all duration-300 hover:scale-[1.02] btn-glow flex items-center justify-center gap-3'
                        >
                            <FaUserShield /> Access Dashboard
                        </button>

                        <div className='text-center'>
                            <p className='text-xs text-gray-500 font-medium'>
                                Protected by enterprise-grade security. <br />
                                Authorized personnel only.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AdminLogin
