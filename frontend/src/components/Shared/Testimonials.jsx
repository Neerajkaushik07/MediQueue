import React, { useState, useEffect } from 'react'
import { testimonials } from '../../assets/assets'

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='flex flex-col items-center gap-4 py-16 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded-xl my-20 px-4'>
            <h1 className='text-3xl font-medium'>What Our Users Say</h1>
            <p className='sm:w-1/3 text-center text-sm mb-8'>Real stories from real people who found their perfect healthcare match.</p>

            <div className='relative w-full max-w-3xl h-[320px] sm:h-[240px]'>
                {testimonials.map((item, index) => {
                    let position = 'opacity-0 translate-x-10 pointer-events-none'
                    if (index === currentIndex) {
                        position = 'opacity-100 translate-x-0 pointer-events-auto z-10'
                    }

                    return (
                        <div
                            key={index}
                            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out transform ${position}`}
                        >
                            <img src={item.image} alt={item.name} className='w-16 h-16 rounded-full object-cover shadow-lg mb-4 border-2 border-white' />
                            <p className='text-gray-600 dark:text-gray-300 text-lg italic mb-4 max-w-2xl text-center leading-relaxed'>"{item.text}"</p>
                            <div className='text-center'>
                                <h3 className='font-semibold text-gray-900 dark:text-white'>{item.name}</h3>
                                <p className='text-sm text-[var(--primary)] font-medium'>{item.role}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className='flex gap-2 mt-4'>
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all duration-300 rounded-full h-2 ${index === currentIndex ? 'bg-[var(--primary)] w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default Testimonials