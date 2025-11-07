import Doctor from "../models/Doctor.models.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Appointment from "../models/Appointment.models.js"
export const changeAvailability=async(req,res)=>{
    try {
        const {docId}=req.body
        const docData=await Doctor.findById(docId)
        await Doctor.findByIdAndUpdate(docId,{avialable:!docData.avialable})
        res.json({success:true,message:'Availability Changed'})
        
        
    } catch (error) {
        res.json({success:false,message:error.message})
    }
    
}
export const getAllDoctors=async(req,res)=>{
    try {
        const doctors=await Doctor.find({}).select("-password -email")
        res.json({success:true,doctors})
    } catch (error) {
        
    }
}
export const doctorLogin=async(req,res)=>{
    try {
        const {email,password}=req.body
        const doctor=await Doctor.findOne({email})
        if(!doctor){
            return res.json({success:false,message:"Data not found"})
        }
        const match=bcrypt.compare(password,doctor.password)
        if(!match){
            return res.json({success:false,message:"Unauthorized request"})

        }
        const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
        res.json({success:true,token})

    } catch (error) {
        consolr.log(error)
    }
}
export const appointmentDoctor=async(req,res)=>{
    try {
        const {docId}=req.body
        const appointments=await Appointment.find({docId})

        res.json({success:true,appointments})
        
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }
}
export const appointmentComplete=async(req,res)=>{
    try {
        const {docId,appointmentId}=req.body
        const appointment=await Appointment.findById(appointmentId)
        if(appointment && appointment.docId===docId){
            await Appointment.findByIdAndUpdate(appointmentId,{isCompleted:true})
            res.json({success:true,message:'Appointment Completed'})
        }else{
            res.json({success:false,message:'Request unauthorized'})
        }
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const cancelAppointment=async(req,res)=>{
    try {
        const {docId,appointmentId}=req.body
        const appointment=await Appointment.findById(appointmentId)
        if(appointment && appointment.docId===docId){
            await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
            res.json({success:true,message:'Appointment Cancelled'})
        }else{
            res.json({success:false,message:'Request unauthorized'})
        }
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const doctorDashboard=async(req,res)=>{
    try {
        const {docId}=req.body
        const appointments=await Appointment.find({docId})
        let earnings=0
        appointments.map((item)=>{
            if(item.payment){
                earnings+=item.amount
            }
        })
        let patients=[]
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })
        const dashData={
            earnings,
            patients:patients.length,
            appointments:appointments.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashData})
    } catch (error) {
        res.json({success:true,message:error.message})
    }
}
export const getProfile=async(req,res)=>{
    try {
        const {docId}=req.body
        const docData=await Doctor.findById(docId).select("-password")
        res.json({success:true,docData})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
export const updateProfile=async(req,res)=>{
    try {
        const {docId,address,avialable,fees}=req.body
        await Doctor.findByIdAndUpdate(docId,{address,avialable,fees})
        res.json({success:true,message:'Profile Updated'})
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }
}