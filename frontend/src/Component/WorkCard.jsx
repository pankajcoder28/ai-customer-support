import React from 'react'

const WorkCard = ({ num, head, description }) => {
  return (
    <div className=' text-black p-6'>
      <div className='flex flex-col items-start gap-3.5'>
       <h1 className='text-4xl md:text-5xl font-[500] opacity-25'>{num}</h1>
       <h3 className='text-2xl font-[500]'>{head}</h3>
       <p className='text-[18px] opacity-25'>{description}</p>
      </div>
    </div>
  )
}

export default WorkCard
