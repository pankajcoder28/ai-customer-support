import React from "react";

const FeatureCard = ({ icon, title, desc }) => {
  const Icon = icon;  

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
        <Icon size={22} />   
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
};

export default FeatureCard;