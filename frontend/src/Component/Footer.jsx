import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
const Footer = () => {
    const navigate = useNavigate();
  return (
    <footer className='w-full bg-white border-t border-gray-100 py-14 px-6 md:px-20'>

      <div className='max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-20'>
        
       
        <div className='flex flex-col gap-4'>
          <h1 className='text-[16px] font-bold text-gray-900'>Product</h1>
          <div className='flex flex-col gap-2.5 text-sm text-gray-500'>
            <p className='hover:text-black cursor-pointer transition-colors' onClick={()=>navigate("/Features")}>Features</p>

            <p className='hover:text-black cursor-pointer transition-colors'>Integrations</p>
          </div>
        </div>

       
        <div className='flex flex-col gap-4'>
          <h1 className='text-[16px] font-bold text-gray-900'>Company</h1>
          <div className='flex flex-col gap-2.5 text-sm text-gray-500'>
            <p className='hover:text-black cursor-pointer transition-colors'>About</p>
            <p className='hover:text-black cursor-pointer transition-colors'>Blog</p>
            <p className='hover:text-black cursor-pointer transition-colors'>Careers</p>
          </div>
        </div>

    
        <div className='flex flex-col gap-4'>
          <h1 className='text-[16px] font-bold text-gray-900'>Resources</h1>
          <div className='flex flex-col gap-2.5 text-sm text-gray-500'>
            <p className='hover:text-black cursor-pointer transition-colors'>Documentation</p>
            <p className='hover:text-black cursor-pointer transition-colors'>Help Center</p>
            <p className='hover:text-black cursor-pointer transition-colors'>API</p>
          </div>
        </div>

     
        <div className='flex flex-col gap-4'>
          <h1 className='text-[16px] font-bold text-gray-900'>Legal</h1>
          <div className='flex flex-col gap-2.5 text-sm text-gray-500'>
            <p className='hover:text-black cursor-pointer transition-colors'>Privacy</p>
            <p className='hover:text-black cursor-pointer transition-colors'>Terms</p>
            <p className='hover:text-black cursor-pointer transition-colors'>Security</p>
          </div>
        </div>

      </div>

      <div className='max-w-7xl mx-auto border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
        <p className='text-xs text-gray-400 font-medium uppercase'>© 2026 SupportAI. All rights reserved.</p>
        <div className='flex gap-6 text-xs text-gray-400 font-bold'>
            <span>TWITTER</span>
            <span>LINKEDIN</span>
            <span>GITHUB</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;