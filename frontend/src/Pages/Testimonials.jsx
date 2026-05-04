import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    { name: "Arun rajput", role: "Lead", text: "Response time reduced by 75%. What an amazing tool!" },
    { name: "Chetna Ambe", role: "Support Team", text: "Automation has made our work very easy." },
    { name: "Pankaj Behera", role: "Manager", text: "The analytics features are excellent. Value for money." },
    { name: "Support Team", role: "Lead", text: "Customer satisfaction skyrocketed after using SupportAI." }
  ];


  const loopReviews = [...reviews, ...reviews];

  return (
    <div style={{ padding: '120px 0', textAlign: 'center', backgroundColor: '#F9F9FA', overflow: 'hidden' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>Loved by Support Teams</h2>
      <p style={{ color: '#6B7280', marginBottom: '40px' }}>See what our customers are saying</p>


      <div className="relative w-full overflow-hidden">

        <div className="animate-scroll flex gap-6 px-6 mt-15">
          {loopReviews.map((item, index) => (
            <div 
              key={index} 
              className="w-80 p-8 border border-gray-100 rounded-3xl shadow-sm text-left bg-white shrink-0"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#facc15" color="#facc15" />
                ))}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">"{item.text}"</p>
              <div>
                <h4 className="font-bold text-gray-900">{item.name}</h4>
                <p className="text-gray-400 text-sm">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;