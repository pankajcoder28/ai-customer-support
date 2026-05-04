import React from 'react'
import WorkCard from '../Component/WorkCard'
import { Works } from '../Component/WorksData'
const Work = () => {
  return (
    <div className='w-full flex flex-col lg:gap-35 bg-white text-black px-2.5 py-18'>
  <div className='flex flex-col gap-4 items-center justify-center'>
        <h1 className='text-3xl lg:text-5xl font-[500]'>How It Works</h1>
        <p className='opacity-50 text-[18px] text-center'>Get started in minutes, not months</p>
      </div>
      <div className='grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto'>
           {
            Works.map((item, index)=>(
              <WorkCard 
              key = {index}
              num = {item.num}
              head = {item.head}
              description = {item.description}
              />
            ))
           } 
      </div>
    </div>
  )
}

export default Work
