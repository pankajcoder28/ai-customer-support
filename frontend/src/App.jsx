import React from 'react'
import MainRoute from './Route/MainRoute'
import { Toaster } from 'react-hot-toast';
const App = () => {
  return (
    <div className='w-full h-screen text-black'>
 <Toaster position="top-center" reverseOrder={false} />
 <MainRoute />
 </div>
  )
}

export default App
