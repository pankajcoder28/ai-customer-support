// import React from 'react'
// import AdminNavbar from '../../Component/AdminNavbar'
// import { Outlet } from 'react-router-dom'
// const AdminLayout = () => {
//   return (
//     <div>
//    <AdminNavbar />
//      <div className="flex-1">
//         <Outlet />
//       </div>
//     </div>
//   )
// }

// export default AdminLayout


import React from 'react'
import AdminNavbar from '../../Component/AdminNavbar'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (

    <div className="flex min-h-screen bg-gray-50">

      <AdminNavbar />
      <div className="flex-1 ml-64 p-8">
        <Outlet />
      </div>
      
    </div>
  )
}

export default AdminLayout
