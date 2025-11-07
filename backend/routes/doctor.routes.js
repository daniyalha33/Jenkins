import express from 'express'
import { appointmentComplete, appointmentDoctor, cancelAppointment, doctorDashboard, doctorLogin, getAllDoctors, getProfile, updateProfile } from '../controllers/doctorControl.js'
import { doctorAuth } from '../middleware/doctorAuth.js'
const doctorRouter=express.Router()
doctorRouter.post('/doctor-list',getAllDoctors)
doctorRouter.post('/doctor-login',doctorLogin)
doctorRouter.get('/appointments',doctorAuth,appointmentDoctor)
doctorRouter.post('/complete-appointment',doctorAuth,appointmentComplete)
doctorRouter.post('/cancel-appointment',doctorAuth,cancelAppointment)
doctorRouter.post('/docDashboard',doctorAuth,doctorDashboard)
doctorRouter.get('/profile',doctorAuth,getProfile)
doctorRouter.post('/update-profile',doctorAuth,updateProfile)

export default doctorRouter
