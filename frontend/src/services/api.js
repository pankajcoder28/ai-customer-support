// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3000/api';

// Helper function to handle API requests
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// AUTH ENDPOINTS
export const authAPI = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getCompanies: () =>
    apiCall('/auth/getcompanies', {
      method: 'GET',
    }),
};

// TICKET ENDPOINTS
export const ticketAPI = {
  getTenantTickets: () =>
    apiCall('/tickets/', {
      method: 'GET',
    }),

  getCustomerTickets: () =>
    apiCall('/tickets/customer', {
      method: 'GET',
    }),

  getTicketDetails: (ticketId) =>
    apiCall(`/tickets/${ticketId}`, {
      method: 'GET',
    }),

  getTicketStats: () =>
    apiCall('/tickets/stats', {
      method: 'GET',
    }),

  assignTicket: (ticketId, agentId) =>
    apiCall(`/tickets/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    }),

  updateTicketStatus: (ticketId, status) =>
    apiCall(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateTicketPriority: (ticketId, priority) =>
    apiCall(`/tickets/${ticketId}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    }),

  resolveTicket: (ticketId) =>
    apiCall(`/tickets/${ticketId}/resolve`, {
      method: 'POST',
    }),

  closeTicket: (ticketId) =>
    apiCall(`/tickets/${ticketId}/close`, {
      method: 'POST',
    }),
};

// MESSAGE/CONVERSATION ENDPOINTS
export const messageAPI = {
  createConversation: (conversationData) =>
    apiCall('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    }),

  getConversations: () =>
    apiCall('/messages/conversations', {
      method: 'GET',
    }),

  getConversationMessages: (conversationId) =>
    apiCall(`/messages/conversations/${conversationId}/messages`, {
      method: 'GET',
    }),

  sendMessage: (messageData) =>
    apiCall('/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),

  closeConversation: (conversationId) =>
    apiCall(`/messages/conversations/${conversationId}/close`, {
      method: 'POST',
    }),
};

// AI ENDPOINTS
export const aiAPI = {
  getAIResponse: (message) =>
    apiCall('/ai/test-response', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  analyzeSentiment: (message) =>
    apiCall('/ai/analyze-sentiment', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

export default apiCall;
