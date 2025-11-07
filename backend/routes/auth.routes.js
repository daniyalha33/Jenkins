import express from 'express'
import { bookAppointment, cancelAppointment, getProfile, listAppointments, login, payOnline, signUp, updateProfile } from '../controllers/authController.js'
import upload from '../middleware/multer.js'
import { authUser } from '../middleware/authUser.js';
const router=express.Router()
router.post('/signup', upload.single('image'), signUp);
router.post('/signin',login)
router.get('/get-profile',authUser,getProfile)
router.post('/update-profile',upload.single('image'),authUser,updateProfile)
router.post('/book-appointment',authUser,bookAppointment)
router.get('/list-appointments',authUser,listAppointments)
router.post('/cancel-appointment',authUser,cancelAppointment)
router.post('/pay-online',authUser,payOnline)
export default router