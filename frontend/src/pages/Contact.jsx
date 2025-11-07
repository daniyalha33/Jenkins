import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-10 text-gray-500'>
        <p>Contact <span className='textgray-700 font-semibold'>Us</span></p>
      </div>
      <div className='flex flex-col md:flex-row justify-center my-10 gap-10 mb-28 text-sm '>
        <img className='w-full max-w-[360px]' src={assets.contact_image} alt="" />
        <div className='flex flex-col gap-6 items-start justify-center'>
        <p className='text-semibold text-lg text-gray-700'>OUR OFFICE</p>
        <p className='text-gray-500'>00000 Willms Station <br />
        Suite 000, Washington, USA</p>
        <p className='text-gray-500'>Tel: 03115682833 <br />
        Email: daniyalha33@gmail.com</p>
        <p className='text-semibold text-lg text-gray-700'>CAREERS AT PRESCRIPTO</p>
        <p className='text-gray-500'>Learn more about our teams and job openings.</p>
        <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
      </div>
      </div>
      
      
    </div>
  )
}

export default Contact
