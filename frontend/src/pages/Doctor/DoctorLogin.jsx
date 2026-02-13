import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const DoctorLogin = () => {

    const [state, setState] = useState('Sign Up')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [about, setAbout] = useState('')
    const [fees, setFees] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    const { backendUrl, setToken, setUserRole } = useContext(AppContext)
    const navigate = useNavigate()

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {

            if (state === 'Sign Up') {

                const { data } = await axios.post(backendUrl + '/api/doctor/register', {
                    name, email, password, speciality, degree, experience, about, fees,
                    address: { line1: address1, line2: address2 }
                })

                if (data.success) {
                    toast.success("Account created! Please login.")
                    setState('Login')
                } else {
                    toast.error(data.message)
                }

            } else {

                const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })

                if (data.success) {
                    localStorage.setItem('token', data.token)
                    localStorage.setItem('userRole', 'doctor')
                    setToken(data.token)
                    setUserRole('doctor')
                    navigate('/doctor-dashboard')
                } else {
                    toast.error(data.message)
                }

            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
                <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Doctor Registration" : "Doctor Login"}</p>
                <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to manage your appointments</p>

                {state === 'Sign Up' &&
                    <div className='w-full'>
                        <div className='w-full'>
                            <p>Full Name</p>
                            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setName(e.target.value)} value={name} required />
                        </div>

                        <div className='flex gap-2 mt-2'>
                            <div className='w-1/2'>
                                <p>Speciality</p>
                                <select className='border border-zinc-300 rounded w-full p-2 mt-1' onChange={(e) => setSpeciality(e.target.value)} value={speciality}>
                                    <option value="General physician">General physician</option>
                                    <option value="Gynecologist">Gynecologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Pediatricians">Pediatricians</option>
                                    <option value="Neurologist">Neurologist</option>
                                    <option value="Gastroenterologist">Gastroenterologist</option>
                                </select>
                            </div>
                            <div className='w-1/2'>
                                <p>Degree</p>
                                <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setDegree(e.target.value)} value={degree} required />
                            </div>
                        </div>

                        <div className='flex gap-2 mt-2'>
                            <div className='w-1/2'>
                                <p>Experience</p>
                                <select className='border border-zinc-300 rounded w-full p-2 mt-1' onChange={(e) => setExperience(e.target.value)} value={experience}>
                                    {[...Array(10).keys()].map(i => <option key={i} value={`${i + 1} Year`}>{i + 1} Year</option>)}
                                </select>
                            </div>
                            <div className='w-1/2'>
                                <p>Fees</p>
                                <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="number" onChange={(e) => setFees(e.target.value)} value={fees} required />
                            </div>
                        </div>

                        <div className='w-full mt-2'>
                            <p>About</p>
                            <textarea className='border border-zinc-300 rounded w-full p-2 mt-1' onChange={(e) => setAbout(e.target.value)} value={about} required />
                        </div>

                        <div className='w-full mt-2'>
                            <p>Address</p>
                            <input className='border border-zinc-300 rounded w-full p-2 mt-1 mb-2' type="text" placeholder="Line 1" onChange={(e) => setAddress1(e.target.value)} value={address1} required />
                            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" placeholder="Line 2" onChange={(e) => setAddress2(e.target.value)} value={address2} required />
                        </div>

                    </div>
                }

                <div className='w-full mt-2'>
                    <p>Email</p>
                    <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
                </div>
                <div className='w-full'>
                    <p>Password</p>
                    <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                </div>

                <button className='bg-primary text-white w-full py-2 rounded-md text-base mt-2'>{state === 'Sign Up' ? "Create Account" : "Login"}</button>
                {
                    state === 'Sign Up'
                        ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
                        : <p>Create an new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
                }
            </div>
        </form>
    )
}

export default DoctorLogin
