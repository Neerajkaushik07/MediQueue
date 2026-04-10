import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'

export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const specialities = [
    'General Physician', 'Gynecologist', 'Dermatologist', 'Pediatricians',
    'Neurologist', 'Gastroenterologist', 'Cardiologist', 'Orthopedic',
    'Psychiatrist', 'Ophthalmologist', 'ENT Specialist', 'Dentist'
]

export const faqs = [
    {
        question: "How do I book an appointment?",
        answer: "To book an appointment, search for a doctor by specialty or name, view their profile, and select 'Book Appointment'. Choose an available date and time slot, then confirm your booking."
    },
    {
        question: "Is there a fee for booking appointments?",
        answer: "Booking appointments through MediQueue is free for patients. You only pay the consultation fee directly to the doctor or clinic at the time of your visit, or online if supported."
    },
    {
        question: "Can I cancel or reschedule my appointment?",
        answer: "Yes, you can cancel or reschedule your appointment from your 'My Appointments' dashboard. Please check the cancellation policy as some doctors may have specific timeframes for cancellations."
    },
    {
        question: "How are doctors verified?",
        answer: "Every doctor on MediQueue undergoes a strict verification process where we validate their medical license, qualifications, and practice details to ensure you receive quality care."
    },
    {
        question: "What if I have an emergency?",
        answer: "For medical emergencies, please visit the nearest hospital or call emergency services immediately. MediQueue is designed for scheduled consultations and non-emergency medical advice."
    }
]

export const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Patient",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        text: "MediQueue made finding a specialist so easy! I was able to book an appointment with a top cardiologist within minutes. The reminded feature is a lifesaver."
    },
    {
        name: "Michael Chen",
        role: "Patient",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "The interface is clean and user-friendly. I love that I can see doctor reviews before booking. It gave me confidence in my choice."
    },
    {
        name: "Dr. Emily Davis",
        role: "Dermatologist",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        text: "As a doctor, this platform helps me manage my appointments efficiently. The patient history feature allows me to prepare for consultations better."
    },
    {
        name: "David Wilson",
        role: "Patient",
        image: "https://randomuser.me/api/portraits/men/85.jpg",
        text: "I used the telemedicine feature for a follow-up, and the video quality was great. It saved me a trip to the clinic. Highly recommended!"
    }
]
