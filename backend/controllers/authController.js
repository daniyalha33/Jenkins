import User from "../models/User.models.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import cloudinary from 'cloudinary';
import Doctor from "../models/Doctor.models.js";
import Appointment from "../models/Appointment.models.js";

export const signUp = async (req, res) => {
  const { name, email, password, birthday, gender, address, phone } = req.body;
  const imageFile = req.file;
  console.log(name)
  console.log(email)
  console.log(birthday)
  console.log(password)
  console.log(gender)
  console.log(String(phone))
  console.log(address)
  if (!email || !name || !password || !gender || !birthday || !phone || !address) {
    return res.status(400).json({ success: false, message: "Details are missing" });
  }


  try {
    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Enter a strong password" });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Image upload
    let imageUrl;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    } else {
      return res.json({ success: false, message: "Image file is required" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      gender,
      address,
      phone,
      birthday: birthday,
    });

    await user.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.json({ error: 'Server error' });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    // Log the userId for debugging
    console.log("Fetching profile for User ID:", userId);

    // Fetch user data, ensuring userId is converted to ObjectId if needed
    const userData = await User.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    res.json({ success: false, message: error.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { userId, name, email, birthday, gender, phone, address } = req.body
    const imageFile = req.file
    if (!name || !email || !birthday || !address || !gender || !phone || !address) {
      return res.json({ success: false, message: 'Fill all the details' })
    }
    await User.findByIdAndUpdate(userId, { name, email, gender, address, phone, birthday })
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      const imageUrl = imageUpload.secure_url;
      await User.findByIdAndUpdate(userId, imageUrl)
    }
    res.json({ success: true, message: 'Profile Updated' })

  } catch (error) {
    res.json({ success: false, message: error.message })

  }

}
export const bookAppointment=async(req,res)=>{
  try {
    const {userId,docId,slotTime,slotDate}=req.body
  const docData=await Doctor.findById(docId).select("-password")
  const userData=await User.findById(userId).select("-password")
  console.log(userData)
  console.log(docData)
  if(!docData.avialable){
    return res.json({success:false,message:"Doctor not available!"})
  }
  let slots_booked=docData.slots_booked
  if(slots_booked[slotDate]){
    if(slots_booked[slotDate].includes(slotTime)){
      return res.json({success:false,message:"Slot not available"})
    }else{
      slots_booked[slotDate].push(slotTime)
    }
  }else{
    slots_booked[slotDate]=[]
    slots_booked[slotDate].push(slotTime)
  }
  console.log(slotDate)
  console.log(slotTime)
  delete docData.slots_booked
  const appointmentData={
    userId,
    docId,
    slotDate,
    slotTime,
    docData,
    userData,
    amount:docData.fees,
    date:Date.now()


  }
  const newAppointment=new Appointment(appointmentData)
  console.log(newAppointment)
  await newAppointment.save()
  await Doctor.findByIdAndUpdate(docId,{slots_booked})
  res.json({success:true,message:'Appointment Booked'})
  } catch (error) {
    
  }
  

}
export const listAppointments=async(req,res)=>{
  try {
    const {userId}=req.body
  const appointments=await Appointment.find({userId})
  res.json({success:true,appointments})
    
  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
    
  }
  
}
export const cancelAppointment=async(req,res)=>{
  try {
    const {userId,appointmentId}=req.body
    const appointmentData=await Appointment.findByIdAndUpdate(appointmentId,{cancelled:true})
    
    if(appointmentData.userId!==userId){
      res.json({success:false,message:'Unauthorized Command'})
    }
   
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
export const payOnline=async(req,res)=>{
  try {
    const {userId,appointmentId}=req.body
    const appointmentData=await Appointment.findByIdAndUpdate(appointmentId,{payment:true})
    
    if(appointmentData.userId!==userId){
      return res.json({success:false,message:'Unauthorized Command'})
    }
    res.json({success:true,message:'Paid successfully'})

    
  } catch (error) {
    
  }
}
