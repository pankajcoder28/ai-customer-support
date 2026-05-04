

import React, { useState } from "react";
import { Bot, Menu, X, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Faetures/auth/auth.slice"; // ⚠️ agar error aaye to ../../ laga dena

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleLogout = () => {
    dispatch(logout());
    
    navigate("/");
  };

  return (
    <div className="w-full px-4 py-3 flex items-center justify-between  bg-white text-black">

      <div className="flex gap-2 items-center">
        <Bot size={35} />
        <h1 className="text-xl font-[400]">SupportAI</h1>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/features">Features</NavLink>
        <NavLink to="/work">How it Works</NavLink>

        <NavLink to="/testimonials">Testimonials</NavLink>
      </div>

      <div className="hidden md:flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className="font-medium flex gap-1.5"><UserRound className="bg-black rounded-full text-white p-1" /> {user?.name}</span>
            <button
           onClick={handleLogout}
           
           
              className="bg-black text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/LoginForm")}>
              Sign in
            </button>
            <button className="bg-black text-white px-3 py-2 rounded-[10px] font-[500]">
              Get Started
            </button>
          </>
        )}
      </div>

      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {isOpen && (
        <div className="absolute top-14 right-5 left-2 bg-white shadow-md flex flex-col gap-4 p-5 md:hidden">
          <NavLink onClick={() => setIsOpen(false)} to="/">Home</NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/features">Features</NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/work">How it Works</NavLink>
          <NavLink onClick={() => setIsOpen(false)} to="/testimonials">Testimonials</NavLink>

          {isLoggedIn ? (
            <>
              <span><UserRound className="bg-black rounded-full text-white p-1" /> {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-black text-white py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/LoginForm")}
                className="border w-full py-2 rounded"
              >
                Sign in
              </button>
              <button className="bg-black text-white py-2 rounded w-full">
                Get Started
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default Navbar;
