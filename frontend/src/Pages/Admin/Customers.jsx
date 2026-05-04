import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Calendar } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations } from '../../Faetures/messages/messagesSlice';

const Customers = () => {
  const dispatch = useDispatch();
  const { conversations, loading } = useSelector((state) => state.messages);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const filteredCustomers = conversations.filter((conv) => {
    return (
      conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'name') {
      return (a.customerName || '').localeCompare(b.customerName || '');
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': 'bg-green-50 text-green-600 border border-green-100',
      'inactive': 'bg-gray-100 text-gray-600 border border-gray-200',
      'pending': 'bg-yellow-50 text-yellow-600 border border-yellow-100'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={28} />
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            </div>
            <p className="text-gray-500">Manage and view customer information</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95 outline-none cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Loading customers...</p>
          </div>
        ) : sortedCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCustomers.map((customer) => (
              <div key={customer._id || customer.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{customer.customerName || 'Unknown Customer'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{customer.subject || 'No subject'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusBadge(customer.status)}`}>
                    {customer.status || 'Active'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-5">
                  {customer.customerEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate">{customer.customerEmail}</span>
                    </div>
                  )}
                  {customer.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="text-gray-400" />
                      <span>{customer.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {customer.createdAt 
                        ? `Joined ${new Date(customer.createdAt).toLocaleDateString()}`
                        : 'Date unknown'
                      }
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Tickets</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{customer.ticketCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Messages</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{customer.messageCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">No customers found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search filters
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        {sortedCustomers.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{sortedCustomers.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Active Now</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {sortedCustomers.filter(c => c.status?.toLowerCase() === 'active').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Tickets</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {sortedCustomers.reduce((sum, c) => sum + (c.ticketCount || 0), 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Messages</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {sortedCustomers.reduce((sum, c) => sum + (c.messageCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
