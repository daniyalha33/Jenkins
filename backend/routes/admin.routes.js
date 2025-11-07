import express from 'express'
import { addDoctor,adminLogin, allDoctors, cancelAppointment, dashData, getAllAppointments } from '../controllers/adminControl.js'
import upload from '../middleware/multer.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { changeAvailability } from '../controllers/doctorControl.js'

const adminRouter=express.Router()
adminRouter.post('/add-doctor',adminAuth,upload.single('image'),addDoctor)
adminRouter.post('/admin-login',adminLogin)
adminRouter.post('/all-doctors',adminAuth,allDoctors)
adminRouter.post('/change-availability',adminAuth,changeAvailability)
adminRouter.get('/appointments',adminAuth,getAllAppointments)
adminRouter.post('/cancel-appointment',adminAuth,cancelAppointment)
adminRouter.get('/dashData',adminAuth,dashData)

export default adminRouter