import React from 'react'
import AppNavbar from '../../Component/AppNavbar'
import { Outlet } from 'react-router-dom'
const AppLayout = () => {
  return (
    <div>
     <AppNavbar />
     <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default AppLayout
