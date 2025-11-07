import isEmail from 'validator/lib/isEmail.js';
import Doctor from '../models/Doctor.models.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.models.js';
import User from '../models/User.models.js';

// Function to add a new doctor
const addDoctor = async (req, res) => {
  try {
    const { name, speciality, about, fees, degree, address, password, email, experience } = req.body;
    const imageFile = req.file;

    console.log({ name, speciality, about, fees, degree, address, password, email, experience }, imageFile);

    // Check if required fields are provided
    if (!name || !email || !password || !fees || !degree || !experience || !address || !about) {
      return res.status(400).json({ success: false, message: "Details are missing" });
    }

    // Validate email format
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Enter a strong password" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if an image file is provided
    let imageUrl;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    } else {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // Create the doctor object
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      speciality,
      degree,
      experience,
      fees,
      address: JSON.parse(address), // Make sure the address is valid JSON
      date: Date.now(),
      about,
    };

    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();

    res.status(201).json({ success: true, message: "Doctor added" });

  } catch (error) {
    console.error("Error adding doctor:", error);
    res.json({ success: false, message: error.message });
  }
};
const allDoctors=async(req,res)=>{
  try {
    const doctors=await Doctor.find({}).select("-password")
    res.json({success:true,doctors})
  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
    
  }
}

// Admin login function
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Set token expiration
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAllAppointments =async (req,res)=>{
  try {
    const appointments=await Appointment.find({})
    res.json({success:true,appointments})
    
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}
 const cancelAppointment=async(req,res)=>{
  try {
    const {appointmentId}=req.body
    const appointmentData=await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
    
   
   
    const {docId,slotDate,slotTime}=appointmentData 
    const docData=await Doctor.findById(docId)
    let slots_booked=docData.slots_booked
    slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
    }
    await Doctor.findByIdAndUpdate(docId,{slots_booked})
    res.json({success:true,message:'Appointment Cancelled'})


  } catch (error) {
    res.json({success:false,message:error.message})
    
  }
}
const dashData=async(req,res)=>{
  try {
    const doctors=await Doctor.find({})
    const appointments=await Appointment.find({})
    const patients=await User.find({})
    const latestAppointments=appointments.reverse().slice(0,5)
    const dashData={doctors:doctors.length,appointments:appointments.length,patients:patients.length,latestAppointments}
    res.json({success:true,dashData})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

export { addDoctor, adminLogin,allDoctors,getAllAppointments,cancelAppointment,dashData };
