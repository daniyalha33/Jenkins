import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
const backendUrl ='http://98.93.87.2:4000';
 export const AppContext=createContext()
 const AppContextProvider=(props)=>{
    const [doctors,setDoctors]=useState([])
    const currencySymbol='$'
    
    const [userData,setUserData]=useState(false)
    const [token, setToken] = useState(
        localStorage.getItem("token") ? localStorage.getItem("token") : ""
      );
    const getDoctorsData=async()=>{
        try {
             const url =`${backendUrl}/api/doctor/doctor-list`

      const { data } = await axios.post(url, {}, {
        headers: { "Content-Type": "application/json" }
      });

            if(data.success){
            setDoctors(data.doctors)
            }
            else{
                toast(data.message)
            }
        }
       
        catch (error) {
            toast(error.message)
            
        }
    }
    const loadUserData=async()=>{
        try {
             const url =`${backendUrl}/api/auth/get-profile`

      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
              if(data.success){
                setUserData(data.userData)
                console.log(data.dob)

              }else{
                toast(error.message)
              }
            
        } catch (error) {
            toast(error.message)
        }

    }
    useEffect(()=>{
        if(token){
            loadUserData()
            
        }else{
            setUserData(false)
        }
    },[token])
       
    const value={
        doctors,currencySymbol,getDoctorsData,setDoctors,token,setToken,userData,setUserData,loadUserData
    }
    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

 }
 export default AppContextProvider
