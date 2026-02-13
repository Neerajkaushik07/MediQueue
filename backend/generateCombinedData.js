import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import doctorModel from './models/doctorModel.js';
import userModel from './models/userModel.js';
import appointmentModel from './models/appointmentModel.js';
import prescriptionModel from './models/prescriptionModel.js';
import medicalRecordModel from './models/medicalRecordModel.js';
import billingModel from './models/billingModel.js';
import emergencyServiceModel from './models/emergencyServiceModel.js';
import connectDB from './config/mongodb.js';

dotenv.config();

const specialties = [
    { name: 'General physician', degree: 'MBBS, MD', feeRange: [40, 60], experienceRange: [5, 15] },
    { name: 'Gynecologist', degree: 'MBBS, MD (OB/GYN)', feeRange: [70, 90], experienceRange: [7, 15] },
    { name: 'Dermatologist', degree: 'MBBS, MD (Dermatology)', feeRange: [60, 80], experienceRange: [5, 12] },
    { name: 'Pediatricians', degree: 'MBBS, MD (Pediatrics)', feeRange: [50, 70], experienceRange: [6, 14] },
    { name: 'Neurologist', degree: 'MBBS, DM (Neurology)', feeRange: [85, 110], experienceRange: [9, 18] },
    { name: 'Gastroenterologist', degree: 'MBBS, MD, DM (Gastroenterology)', feeRange: [75, 95], experienceRange: [7, 14] },
    { name: 'Cardiologist', degree: 'MBBS, MD, DM (Cardiology)', feeRange: [90, 120], experienceRange: [10, 20] },
    { name: 'Orthopedic', degree: 'MBBS, MS (Orthopedics)', feeRange: [80, 110], experienceRange: [8, 16] }
];

const firstNames = {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Dorothy', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia']
};

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green'];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const allergiesList = ['Penicillin', 'Peanuts', 'Shellfish', 'Latex', 'Aspirin'];
const conditionsList = ['Diabetes', 'Hypertension', 'Asthma'];

const locations = [
    { line1: '123 Medical Plaza', line2: 'Downtown' },
    { line1: '456 Health Center', line2: 'West End' },
    { line1: '789 Care Clinic', line2: 'East Side' }
];

const generateDoctors = async (count = 50) => {
    console.log(`\n🔄 Generating ${count} Doctor profiles...`);
    const doctors = [];
    const usedEmails = new Set();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('doctor321', salt);

    for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}@mediqueue.com`;

        if (usedEmails.has(email)) continue;
        usedEmails.add(email);

        const specialty = specialties[Math.floor(Math.random() * specialties.length)];
        const portraitGender = gender === 'male' ? 'men' : 'women';
        const photoId = Math.floor(Math.random() * 99);

        doctors.push({
            name: `Dr. ${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            speciality: specialty.name,
            degree: specialty.degree,
            experience: `${Math.floor(Math.random() * 20) + 5} Years`,
            about: `Expert in ${specialty.name} with a passion for patient care.`,
            fees: Math.floor(Math.random() * 50) + 50,
            address: locations[Math.floor(Math.random() * locations.length)],
            image: `https://randomuser.me/api/portraits/${portraitGender}/${photoId}.jpg`,
            available: true,
            slots_booked: {},
            date: Date.now()
        });
    }
    return doctors;
};

const generatePatients = async (count = 100) => {
    console.log(`🔄 Generating ${count} Patient profiles...`);
    const patients = [];
    const usedEmails = new Set();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('patient321', salt);

    for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}@mediqueue.com`;

        if (usedEmails.has(email)) continue;
        usedEmails.add(email);

        const portraitGender = gender === 'male' ? 'men' : 'women';
        const photoId = Math.floor(Math.random() * 99);

        patients.push({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            image: `https://randomuser.me/api/portraits/${portraitGender}/${photoId}.jpg`,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            address: locations[Math.floor(Math.random() * locations.length)],
            gender: gender.charAt(0).toUpperCase() + gender.slice(1),
            dob: `19${Math.floor(Math.random() * 20) + 80}-01-01`,
            bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
            allergies: [allergiesList[Math.floor(Math.random() * allergiesList.length)]],
            chronicConditions: [conditionsList[Math.floor(Math.random() * conditionsList.length)]],
            role: 'patient'
        });
    }
    return patients;
};

const seedData = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await doctorModel.deleteMany({});
        await userModel.deleteMany({});
        await appointmentModel.deleteMany({});
        await prescriptionModel.deleteMany({});
        await medicalRecordModel.deleteMany({});
        await billingModel.deleteMany({});
        await emergencyServiceModel.deleteMany({});
        console.log('🗑️  Cleared existing data (Doctors, Users, Appointments, Prescriptions, Records, Billing, Emergency)');

        // Seed Doctors
        const doctorsData = await generateDoctors(60);
        const insertedDoctors = await doctorModel.insertMany(doctorsData);
        console.log(`✅ Seeded ${insertedDoctors.length} Doctors`);

        // Seed Patients
        const patientsData = await generatePatients(120);
        const insertedPatients = await userModel.insertMany(patientsData);
        console.log(`✅ Seeded ${insertedPatients.length} Patients`);

        // Seed Appointments
        console.log('🔄 Generating limited Appointments...');
        const appointments = [];
        const today = new Date();

        // Limit appointments to keep slots available
        for (let i = 0; i < insertedDoctors.length; i++) {
            const doctor = insertedDoctors[i];
            const numApps = Math.floor(Math.random() * 2) + 1; // 1-2 appointments per doctor

            for (let j = 0; j < numApps; j++) {
                const patient = insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
                const daysOffset = Math.floor(Math.random() * 10) - 5; // -5 to +5 days
                const date = new Date(today);
                date.setDate(today.getDate() + daysOffset);

                const slotDate = date.toISOString().split('T')[0];
                const slotTime = `${Math.floor(Math.random() * 8) + 9}:00`;

                appointments.push({
                    userId: patient._id.toString(),
                    docId: doctor._id.toString(),
                    slotDate,
                    slotTime,
                    userData: patient,
                    docData: doctor,
                    amount: doctor.fees,
                    date: date.getTime(),
                    cancelled: false,
                    payment: true,
                    isCompleted: daysOffset < 0
                });
            }
        }

        const insertedAppointments = await appointmentModel.insertMany(appointments);
        console.log(`✅ Seeded ${insertedAppointments.length} Appointments`);

        // Seed some Prescriptions and Medical Records for completed appointments
        console.log('🔄 Generating Prescriptions and Medical Records...');
        const prescriptions = [];
        const records = [];

        insertedAppointments.filter(app => app.isCompleted).forEach((app, index) => {
            if (index > 20) return; // Only first 20 completed ones

            prescriptions.push({
                userId: app.userId,
                doctorId: app.docId,
                appointmentId: app._id,
                prescriptionNumber: `PRX-${Date.now()}-${index}`,
                medications: [{
                    name: 'Paracetamol',
                    dosage: '500mg',
                    frequency: 'Twice daily',
                    duration: '3 days',
                    morningDose: true,
                    nightDose: true,
                    afterMeal: true
                }],
                diagnosis: 'Mild Fever',
                instructions: 'Take rest and drink plenty of fluids.'
            });

            records.push({
                userId: app.userId,
                recordType: 'consultation',
                title: 'General Consultation',
                description: 'Patient presented with mild fever symptoms.',
                diagnosis: 'Seasonal Fever',
                doctorId: app.docId,
                doctorName: app.docData.name,
                hospital: 'MediQueue General Hospital',
                date: new Date(app.date)
            });
        });

        await prescriptionModel.insertMany(prescriptions);
        await medicalRecordModel.insertMany(records);
        console.log(`✅ Seeded ${prescriptions.length} Prescriptions and ${records.length} Medical Records`);

        // Seed Billing
        console.log('🔄 Generating Billing records...');
        const billingRecords = [];
        insertedAppointments.slice(0, 40).forEach((app, index) => {
            const amount = app.amount;
            billingRecords.push({
                userId: app.userId,
                billNumber: `BILL-${Date.now()}-${index}`,
                billType: 'consultation',
                appointmentId: app._id,
                hospitalName: 'MediQueue General Hospital',
                doctorId: app.docId,
                doctorName: app.docData.name,
                items: [{
                    description: 'Consultation Fee',
                    unitPrice: amount,
                    totalPrice: amount
                }],
                subtotal: amount,
                totalAmount: amount,
                patientPayable: amount,
                paymentStatus: app.payment ? 'paid' : 'pending',
                paymentMethod: 'Stripe',
                paymentDate: app.payment ? new Date(app.date) : null
            });
        });
        await billingModel.insertMany(billingRecords);
        console.log(`✅ Seeded ${billingRecords.length} Billing records`);

        // Seed Emergency Services
        console.log('🔄 Generating Emergency Service requests...');
        const emergencyRequests = [];
        insertedPatients.slice(0, 15).forEach((patient, index) => {
            emergencyRequests.push({
                userId: patient._id,
                serviceType: index % 3 === 0 ? 'ambulance' : (index % 3 === 1 ? 'emergency_consultation' : 'police'),
                status: 'completed',
                urgencyLevel: 'high',
                description: 'Emergency assistance requested via app.',
                location: {
                    address: patient.address.line1 + ', ' + patient.address.line2,
                },
                patientDetails: {
                    name: patient.name,
                    age: Math.floor(Math.random() * 40) + 20,
                    gender: patient.gender,
                    condition: 'Acute chest pain / Emergency situation'
                },
                contactNumber: patient.phone,
                requestTime: new Date(today.getTime() - (index * 3600000))
            });
        });
        await emergencyServiceModel.insertMany(emergencyRequests);
        console.log(`✅ Seeded ${emergencyRequests.length} Emergency Service requests`);

        console.log('\n✨ Seeding completed successfully!');
        console.log('🔑 Doctor login password: "doctor321"');
        console.log('🔑 Patient login password: "patient321"');
        console.log('📧 Email format: firstnamelastname@mediqueue.com');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
