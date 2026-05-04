import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, UserCircle2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTenantTickets, updateTicketStatusAsync, updateTicketPriorityAsync } from '../../Faetures/tickets/ticketSlice';

const AdminTickets = () => {
  const dispatch = useDispatch();
  const { items: ticketData, loading } = useSelector((state) => state.tickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchTenantTickets());
  }, [dispatch]);

  const filteredTickets = ticketData.filter((ticket) => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || ticket.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusBgColor = (status) => {
    const statusMap = {
      'open': 'bg-orange-50 text-orange-600 border border-orange-100',
      'in progress': 'bg-yellow-50 text-yellow-600 border border-yellow-100',
      'resolved': 'bg-green-50 text-green-600 border border-green-100',
      'closed': 'bg-gray-100 text-gray-500 border border-gray-100'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-500';
  };

  const getPriorityBgColor = (priority) => {
    const priorityMap = {
      'high': 'bg-red-50 text-red-600',
      'medium': 'bg-yellow-50 text-yellow-600',
      'low': 'bg-gray-100 text-gray-500'
    };
    return priorityMap[priority?.toLowerCase()] || 'bg-gray-100 text-gray-500';
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await dispatch(updateTicketStatusAsync({ ticketId, status: newStatus }));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await dispatch(updateTicketPriorityAsync({ ticketId, priority: newPriority }));
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-8">
    
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and track customer support requests</p>
        </div>
        <button className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95">
          <Plus size={20} />
          <span>New Ticket</span>
        </button>
      </div>


      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95 outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

    
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <p>Loading tickets...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900">Ticket ID</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900">Customer</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900">Subject</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900 text-center">Status</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900 text-center">Priority</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900">Assignee</th>
                  <th className="px-6 py-5 text-sm font-bold text-gray-900">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket._id || ticket.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-6 text-sm font-medium text-gray-400">#{ticket._id?.slice(-5) || ticket.id}</td>
                      <td className="px-6 py-6 font-bold text-gray-800 text-sm">{ticket.customer || 'N/A'}</td>
                      <td className="px-6 py-6 text-sm text-gray-600 font-medium">{ticket.subject}</td>
                      <td className="px-6 py-6 text-center">
                        <select
                          value={ticket.status || 'open'}
                          onChange={(e) => handleStatusChange(ticket._id || ticket.id, e.target.value)}
                          className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border-0 outline-none cursor-pointer ${getStatusBgColor(ticket.status)}`}
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <select
                          value={ticket.priority || 'medium'}
                          onChange={(e) => handlePriorityChange(ticket._id || ticket.id, e.target.value)}
                          className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border-0 outline-none cursor-pointer ${getPriorityBgColor(ticket.priority)}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <UserCircle2 size={16} />
                          </div>
                          {ticket.assignedTo || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-400 font-medium">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                      No tickets found
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

export default AdminTickets;
