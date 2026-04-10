import React from 'react'
import { specialityData } from '../../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
    return (
        <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
            <h1 className='text-3xl font-medium'>Find by Speciality</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
            <div className='flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-8 w-full overflow-scroll sm:overflow-visible scrollbar-hide px-4'>
                {specialityData.map((item, index) => (
                    <Link onClick={() => scrollTo(0, 0)} className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-300 p-4 border border-transparent hover:border-gray-100 hover:shadow-lg rounded-xl' key={index} to={`/doctors/${item.speciality}`}>
                        <img className='w-16 sm:w-20 mb-3 shadow-sm rounded-full bg-white p-2' src={item.image} alt="" />
                        <p className='text-center font-medium'>{item.speciality}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu
