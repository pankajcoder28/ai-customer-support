import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Faetures/auth/auth.slice';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Ticket, 
  Users, 
  Bot, 
  Settings,
  LogOut
} from 'lucide-react';

const AdminNavbar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Live Chat', icon: <MessageSquare size={20} />, path: '/admin/chat' },
    { name: 'Tickets', icon: <Ticket size={20} />, path: '/admin/admintickets' },
    { name: 'Customers', icon: <Users size={20} />, path: '/admin/customers' },
    { name: 'AI Assistant', icon: <Bot size={20} />, path: '/admin/ai' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col p-4 fixed left-0 top-0">

     
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Bot className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SupportAI</h1>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">
            Customer Support
          </p>
        </div>
      </div>

    
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto border-t border-gray-100 pt-6 px-2">
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition"
        >
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "A"}
          </div>

          <div className="flex flex-col text-left flex-1">
            <span className="text-sm font-bold text-gray-900">
              {user?.name || "Admin"}
            </span>
            <span className="text-xs text-gray-400 uppercase font-semibold">
              {user?.role || "Admin"}
            </span>
          </div>
        </button>

        {showLogout && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar;