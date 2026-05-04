import React from 'react'
import FeatureCard from '../Component/FeatureCard'
import { features } from '../Component/featuresData'

const Features = () => {
  return (
    <div className='w-full bg-[#F9F9FA] text-black px-2.5 py-18'>
      
      <div className='flex flex-col gap-4 items-center justify-center'>
        <h1 className='text-3xl lg:text-5xl font-[500]'>Powerful Features</h1>
        <p className='opacity-50 text-[18px] text-center'>
          Everything you need to deliver exceptional customer support
        </p>
      </div>

      <div className='grid md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto'>
        {features.map((item, index) => (
          <FeatureCard
            key={index}
            icon={item.icon}
            title={item.title}
            desc={item.desc}
          />
        ))}
      </div>

    </div>
  )
}

export default Features