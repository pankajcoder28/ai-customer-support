
import React, { useState } from "react";
import { Bot, Menu, X, UserRound } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Faetures/auth/auth.slice";
import { useNavigate, NavLink } from "react-router-dom";

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="w-full px-4 h-14 flex items-center justify-between bg-white relative">

      <div className="flex items-center gap-2">
        <Bot size={28} />
        <h1 className="font-semibold">SupportAI</h1>
      </div>

      <div className="hidden md:flex items-center gap-6">
 <NavLink to="/app/get-help">Get Help</NavLink>
        <NavLink to="/app/tickets">Tickets</NavLink>
        <NavLink to="/app/help-center">Help Center</NavLink>
       
      </div>

      <div className="hidden md:flex items-center gap-4">
        <span className="font-medium flex gap-1.5"><UserRound className="bg-black rounded-full text-white p-1" /> {user?.name}</span>

        <button
          onClick={handleLogout}
          className="bg-black text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-md flex flex-col gap-4 p-5 md:hidden">

         <NavLink onClick={() => setIsOpen(false)} to="/app/get-help">
            Get Help
          </NavLink>

          <NavLink onClick={() => setIsOpen(false)} to="/app/tickets">
            Tickets
          </NavLink>

          <NavLink onClick={() => setIsOpen(false)} to="/app/help-center">
            Help Center
          </NavLink>

          

          <div className="border-t pt-3 flex flex-col gap-3">
            <span className="font-medium flex gap-1.5"><UserRound className="bg-black rounded-full text-white p-1" />{user?.name}</span>

            <button
              onClick={handleLogout}
              className="bg-black text-white py-2 rounded"
            >
              Logout
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AppNavbar;