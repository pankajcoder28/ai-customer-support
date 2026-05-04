
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCustomerTickets, addTicket } from "../../Faetures/tickets/ticketSlice";
import { messageAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Tickets = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { items: allTickets, loading } = useSelector((state) => state.tickets);

  useEffect(() => {
    dispatch(fetchCustomerTickets());
  }, [dispatch]);

  const filteredTickets = allTickets.filter(ticket =>
    ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicketSubject.trim()) {
      toast.error('Please enter a ticket subject');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating ticket...');

    try {
      const result = await messageAPI.createConversation({
        subject: newTicketSubject,
        type: 'support_ticket'
      });

      const ticketData = result.data || result;
      dispatch(addTicket(ticketData));
      
      toast.success('Ticket created successfully!', { id: toastId });
      setNewTicketSubject(''); 
      setIsModalOpen(false); 
    } catch (error) {
      toast.error(error.message || 'Failed to create ticket', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'open': 'bg-orange-100 text-orange-700',
      'in progress': 'bg-yellow-100 text-yellow-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-gray-100 text-gray-700'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'high': 'bg-red-100 text-red-600',
      'medium': 'bg-yellow-100 text-yellow-600',
      'low': 'bg-blue-100 text-blue-600'
    };
    return priorityMap[priority?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto font-sans">
      

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Support Tickets</h1>
          <p className="text-gray-500">Track and manage your support requests</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          <span className="text-xl">+</span> New Ticket
        </button>
      </div>

  
      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search your tickets..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Loading tickets...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket._id || ticket.id} className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-white relative group">
                <div className="flex gap-3 items-center mb-3">
                  <span className="text-gray-400 text-sm font-mono">#{ticket._id?.slice(-5) || ticket.id}</span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status || 'Open'}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority || 'Medium'}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">{ticket.subject}</h2>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Assigned to: <span className="font-medium text-gray-700">{ticket.assignedTo || 'Unassigned'}</span></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">💬 {ticket.replies || 0} replies</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                  Created {new Date(ticket.createdAt).toLocaleDateString() || 'Just now'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No tickets found matching your search.</p>
            </div>
          )}
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Create New Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Subject</label>
                <input 
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-black outline-none transition disabled:opacity-50"
                  placeholder="Briefly describe the problem"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
