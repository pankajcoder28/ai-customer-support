import React from 'react'
import { use } from 'react'
import { useNavigate } from 'react-router-dom'
const Start = () => {
    const navigate = useNavigate();
  return (
    <div className="w-full bg-gradient-to-r from-[#f7d6d6] to-[#FFF0E6] px-3.5 py-20 flex flex-col items-center justify-center gap-5">
      <h1 className='text-4xl md:text-5xl font-[500]'>Ready to Transfom Your Support?</h1>
      <p className='text-[22px] opacity-40'>Join thousands of teams already using SupportAI</p>
      <button className='bg-black text-white px-8 py-2 rounded-[10px]' onClick={()=>navigate("/app/get-help")}>Start</button>
    </div>
  )
}

export default Start
