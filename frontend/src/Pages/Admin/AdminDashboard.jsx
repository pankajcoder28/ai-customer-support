import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { fetchTicketStats, fetchTenantTickets } from "../../Faetures/tickets/ticketSlice";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useSelector((state) => state);
  const { stats, items: tickets, loading } = useSelector((state) => state.tickets);

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "admin") {
      navigate("/");
    }
  }, [auth, navigate]);

  useEffect(() => {
    dispatch(fetchTicketStats());
    dispatch(fetchTenantTickets());
  }, [dispatch]);

  const dashboardStats = [
    { 
      title: "Active Conversations", 
      value: stats?.activeConversations || "0", 
      change: "+12%", 
      icon: <MessageSquare className="text-orange-500" />, 
      color: "bg-orange-50" 
    },
    { 
      title: "Resolved Today", 
      value: stats?.resolvedToday || "0", 
      change: "+8%", 
      icon: <CheckCircle className="text-emerald-500" />, 
      color: "bg-emerald-50" 
    },
    { 
      title: "Avg Response Time", 
      value: stats?.avgResponseTime || "0m", 
      change: "-15%", 
      icon: <Clock className="text-blue-500" />, 
      color: "bg-blue-50" 
    },
    { 
      title: "Customer Satisfaction", 
      value: stats?.satisfaction || "0%", 
      change: "+3%", 
      icon: <TrendingUp className="text-yellow-500" />, 
      color: "bg-yellow-50" 
    },
  ];

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {dashboardStats.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.title}</span>
              <div className={`${item.color} p-2 rounded-lg`}>{item.icon}</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{item.value}</span>
              <span className={`text-xs font-bold ${item.change.startsWith('+') ? 'text-emerald-500' : 'text-blue-500'}`}>
                {item.change} from yesterday
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Recent Tickets</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <p>Loading tickets...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTickets.length > 0 ? (
                  recentTickets.map((ticket) => (
                    <tr key={ticket._id || ticket.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-400">#{ticket._id?.slice(-5) || ticket.id}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{ticket.customer || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{ticket.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.status?.toLowerCase() === 'open' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {ticket.status || 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {ticket.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No recent tickets
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;