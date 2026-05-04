
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../Layout/Layout' 
import Home from '../Pages/Home'
import Features from '../Pages/Features'
import Work from '../Pages/Work'
import Testimonials from '../Pages/Testimonials'
import LoginForm from '../Pages/LoginForm'
import Register from '../Pages/Register'
 import AppLayout from '../Pages/App/AppLayout'
import GetHelp from '../Pages/App/GetHelp'
import HelpCenter from '../Pages/App/HelpCenter'
import Tickets from '../Pages/App/Tickets'
import AdminDashboard from '../Pages/Admin/AdminDashboard'
import AdminLayout from '../Pages/Admin/AdminLayout'
import AdminTickets from '../Pages/Admin/AdminTickets'
import Chat from '../Pages/Admin/Chat'
import AI from '../Pages/Admin/AI'
import Customers from '../Pages/Admin/Customers'
import Settings from '../Pages/Admin/Settings'
const MainRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="features" element={<Features />} />
        <Route path="work" element={<Work />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="testimonials" element={<Testimonials />} />
<Route path="loginform" element={<LoginForm />} />
<Route path="register" element={<Register />} />

      </Route>
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="adminTickets" element={<AdminTickets />} />
<Route path='chat' element={<Chat />} />
<Route path='ai' element={<AI/>} />
<Route path='customers' element={<Customers />} />
<Route path='settings' element={<Settings />} />
</Route>


      <Route path="/app" element={<AppLayout />}>
        <Route path="tickets" element={<Tickets />} />
        <Route path="help-center" element={<HelpCenter />} />
        <Route path="get-help" element={<GetHelp />} />
      </Route>

    </Routes>
  )
}

export default MainRoute