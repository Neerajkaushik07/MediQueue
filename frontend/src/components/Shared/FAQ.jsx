import React, { useState } from 'react'
import { faqs } from '../../assets/assets'

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null)

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index)
    }

    return (
        <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='faq'>
            <h1 className='text-3xl font-medium'>Frequently Asked Questions</h1>
            <p className='sm:w-1/3 text-center text-sm'>Common questions about our services and booking process.</p>

            <div className='w-full max-w-3xl px-4 mt-8 flex flex-col gap-4'>
                {faqs.map((item, index) => (
                    <div
                        key={index}
                        className={`border rounded-xl overflow-hidden transition-all duration-300 ${activeIndex === index ? 'border-[var(--primary)] bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <button
                            className='w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none'
                            onClick={() => toggleAccordion(index)}
                        >
                            <span className={`font-medium text-lg ${activeIndex === index ? 'text-[var(--primary)]' : 'text-gray-900'}`}>{item.question}</span>
                            <span className='flex-shrink-0 ml-4'>
                                <svg
                                    className={`w-6 h-6 transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-[var(--primary)]' : 'text-gray-400'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        <div
                            className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeIndex === index ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                        >
                            <p className='text-gray-600 leading-relaxed'>{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FAQ