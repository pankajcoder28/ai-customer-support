
import React, { useState } from 'react';
import { User, Mail, Lock, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../Faetures/auth/auth.slice';
import toast from 'react-hot-toast';

const Register = () => {
  const [userType, setUserType] = useState('customer'); // customer / admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    const toastId = toast.loading("Creating account...");

    try {
      const result = await dispatch(registerUser({
        name,
        email,
        password,
        role: userType.toLowerCase(),
      }));

      if (result.payload) {
        toast.success("Registration successful! Please log in.", { id: toastId });
        setTimeout(() => {
          navigate("/loginform");
        }, 500);
      } else if (result.error) {
        toast.error(result.payload || "Registration failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Registration failed. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* LOGO */}
      <div className="text-center mb-8">
        <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Bot size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">SupportAI</h1>
        <p className="text-gray-500 mt-1">Join us today</p>
      </div>
      <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          
          <button
            type="button"
            onClick={() => setUserType('customer')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg ${
              userType === 'customer'
                ? 'bg-black text-white'
                : 'text-gray-500'
            }`}
          >
            Customer
          </button>

          <button
            type="button"
            onClick={() => setUserType('admin')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg ${
              userType === 'admin'
                ? 'bg-black text-white'
                : 'text-gray-500'
            }`}
          >
            Admin
          </button>

        </div>
        <form className="space-y-5" onSubmit={handleRegister}>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-black disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-black disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-black disabled:opacity-50"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span
              className="text-black font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/loginform")}
            >
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;