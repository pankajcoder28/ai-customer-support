
import React, { useState } from 'react';
import { Mail, Lock, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../Faetures/auth/auth.slice"; 
import toast from 'react-hot-toast';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('customer');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      const toastId = toast.loading("Connecting to Google...");

      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleData = await res.json();

        const result = await dispatch(loginUser({
          email: googleData.email,
          password: googleData.id, // Use google ID as password
          role: activeTab
        }));

        if (result.payload) {
          toast.success(`Welcome back, ${googleData.name}!`, { id: toastId });
          setTimeout(() => {
            navigate(activeTab === "admin" ? "/admin" : "/app/tickets");
          }, 500);
        } else {
          toast.error("Google authentication failed", { id: toastId });
        }
      } catch (error) {
        toast.error("Google authentication failed", { id: toastId });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging in...");

    try {
      const result = await dispatch(loginUser({
        email,
        password,
        role: activeTab
      }));

      if (result.payload) {
        toast.success(`Welcome back!`, { id: toastId });
        setTimeout(() => {
          navigate(activeTab === "admin" ? "/admin" : "/app/tickets");
        }, 500);
      } else if (result.error) {
        toast.error(result.payload || "Invalid email or password", { id: toastId });
      }
    } catch (error) {
      toast.error("Login failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="text-center mb-8">
        <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Bot size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">SupportAI</h1>
        <p className="text-gray-500 mt-1">Welcome back to SupportAI</p>
      </div>

     
      <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
        

        <button
          onClick={() => handleGoogleLogin()}
          disabled={isGoogleLoading || loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all mb-6 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-5 h-5" />
          {isGoogleLoading ? "Verifying..." : "Continue with Google"}
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-semibold">
            <span className="px-3 bg-white text-gray-400">or sign in with email</span>
          </div>
        </div>

   
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          {['customer', 'admin'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>


        <form className="space-y-5" onSubmit={handleLogin}>
          
       
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-black outline-none focus:border-black transition-colors disabled:opacity-50"
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-black outline-none focus:border-black transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-900 transition-all active:scale-[0.99] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <span
              className="text-black font-bold cursor-pointer hover:underline underline-offset-4"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>

     
        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => navigate("/")} 
            className="flex-1 py-2.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase"
          >
            Demo User
          </button>
          <button 
            onClick={() => navigate("/admin")} 
            className="flex-1 py-2.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase"
          >
            Demo Admin
          </button>
        </div>

      </div>
    </div>
  );
};

const LoginFormWrapper = () => (
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
    <LoginForm />
  </GoogleOAuthProvider>
);

export default LoginFormWrapper;