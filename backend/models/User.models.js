import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required:true
    
  },
  gender: {
    type: String,
    default:'Not Selected', // Adjust as needed
    
  },
  birthday: {
    type: String,
    default:'Not Selected', // Optional
  },
  address:{
    type:String,
    required:true,

  },
  phone: {
    type: String,
    default: '0000000', // Optional
  },
});

const User = mongoose.model('User', userSchema);

export default User;
