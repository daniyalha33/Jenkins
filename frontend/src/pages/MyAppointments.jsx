import React, { useContext,useEffect,useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets_frontend/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const[appointments,setAppointments]=useState([])
  const {doctors,token,getDoctorsData}=useContext(AppContext)
  const months=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const slotDateFormatted=(slotDate)=>{
    const dateArray=slotDate.split('_')
    return dateArray[0]+" "+months[Number(dateArray[1])]+" "+dateArray[2]

  }
  const backendUrl = '';
  const getAppointmentData=async(req,res)=>{
    try {
      const {data}=await axios.get(`${backendUrl}/api/auth/list-appointments`,{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        setAppointments(data.appointments.reverse())
        console.log(data.appointments)
      }else{
        toast(data.message)
      }
      
    } catch (error) {
      toast(error.message)
      
    }
  }
  const cancelAppointment=async(appointmentId)=>{
    try {
      const {data}=await axios.post(`${backendUrl}/api/auth/cancel-appointment`,{appointmentId},{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        toast(data.message)
        getAppointmentData()
        getDoctorsData()
      }else{
        toast(data.message)
      }
      
    } catch (error) {
      toast(error.message)
      
    }
  }
  const payOnline=async(appointmentId)=>{
    try {
      const {data}=await axios.post(`${backendUrl}/api/auth/pay-online`,{appointmentId},{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        toast(data.message)
        getAppointmentData()
      }else{
        toast(data.message)
      }
    } catch (error) {
      toast(error.message)
    }
  }
  useEffect(()=>{
    if(token){
      getAppointmentData()
    }
  },[token])
  return (
    <div className='pb-3 mt-12 font-medium text-zinc-700 border-b'>
      <p>My Appointments</p>
      <div>
        {appointments.map((item,index)=>(
          
          <div className='grid grid-cols-[1fr_2fr] gap-6 sm:flex py-2 border-b' key={index}>
            <div><img className='w-32 bg-indigo-50' src={item.docData.image} alt="" /></div>
            <div className='flex-start text-sm text-zinc-600'>
              <p className='font-semibold text-neutral-800'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-sm'>{item.docData.address.address1}</p>
              <p className='text-sm'>{item.docData.address.address2}</p>
              <p  className='text-sm mt-1'>Date & time: <span className='text-sm text-neutral-700 font-medium'> {item.slotTime}</span></p>
            </div>
            <div></div>
            
            <div className='flex flex-col gap-2 justify-center'>
              {!item.cancelled && item.payment && item.isCompleted &&<button className='sm:min-w-48 py-2 rounded text-stone-500 bg-indigo-50'>Paid</button>}
            {!item.cancelled && !item.payment && !item.isCompleted &&<button onClick={()=>payOnline(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>
                Pay Online
                </button>}
                {!item.cancelled && !item.isCompleted && !item.payment &&<button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-700 hover:text-white transition-all duration-300'>
                  Cancel Appointment
                </button>}
                {item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Cancelled</button>}
                {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}


export default MyAppointments
