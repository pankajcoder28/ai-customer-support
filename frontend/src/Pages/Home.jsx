import React from 'react';
import { Zap, MoveRight } from 'lucide-react';
import Features from './Features';
import Work from './Work';
import { useNavigate } from 'react-router-dom';
import Testimonials from './Testimonials';
import Start from '../Component/Start'
import Footer from '../Component/Footer';

const Home = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));


  const handleStartTrial = () => {
    if (user?.role === "admin") {
      alert("Admin cannot access customer trial flow");
      return;
    }

    navigate("/app/get-help");
  };


  const handleDashboard = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "customer") {
      navigate("/app/tickets");
    } else {
      navigate("/loginform");
    }
  };

  return (
    <div className='w-full px-2 bg-white text-black'>

      <div className='flex flex-col items-center justify-center gap-10 py-16'>

  
        <div className='flex items-center gap-1 px-2.5 py-2 bg-[#E2E2E5] rounded-2xl'>
          <Zap size={18} />
          <h3 className='text-[13px]'>
            Trusted by 10,000+ companies Worldwide
          </h3>
        </div>

        <div className='text-center flex flex-col gap-3.5'>
          <h1 className='text-5xl md:text-7xl font-[500] leading-tight md:leading-[80px]'>
            Transform Customer <br /> Support with AI
          </h1>
          <p className='opacity-45 text-[20px]'>
            Resolve tickets 10x faster with intelligent automation.
          </p>
        </div>

        <div className='w-full md:w-fit flex flex-col md:flex-row gap-4'>


          <button
            onClick={handleStartTrial}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-[10px]"
          >
            Start Free Trial <MoveRight size={18} />
          </button>

          <button
            onClick={handleDashboard}
            className="text-[17px] border px-5 py-2 rounded-[10px] hover:bg-[#e6e6ef]"
          >
            Go to Dashboard
          </button>

        </div>


        <div className='flex flex-col items-center md:flex-row gap-8 md:gap-24 py-4'>

          <div className='flex flex-col items-center gap-2'>
            <h1 className='text-4xl'>10X</h1>
            <p className='opacity-45'>Faster Resolution</p>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <h1 className='text-4xl'>95%</h1>
            <p className='opacity-45'>Customer Satisfaction</p>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <h1 className='text-4xl'>60%</h1>
            <p className='opacity-45'>Cost Reduction</p>
          </div>

        </div>

      </div>

      <Features />
      <Work />
      <Testimonials />
      <Start />
      <Footer />
    </div>
  );
};

export default Home;