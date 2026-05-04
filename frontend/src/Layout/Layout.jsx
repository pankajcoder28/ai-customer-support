import React from "react";
import Navbar from "../Component/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="w-full bg-black text-white min-h-screen">
      <div className="max-w-[1300px] mx-auto px-4">
        <Navbar />

        <Outlet /> 

      </div>
    </div>
  );
};

export default Layout;