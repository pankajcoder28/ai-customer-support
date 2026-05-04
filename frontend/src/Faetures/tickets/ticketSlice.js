import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ticketAPI } from '../../services/api';

// Async thunks
export const fetchTenantTickets = createAsyncThunk(
  'tickets/fetchTenantTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.getTenantTickets();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerTickets = createAsyncThunk(
  'tickets/fetchCustomerTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.getCustomerTickets();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTicketStats = createAsyncThunk(
  'tickets/fetchTicketStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.getTicketStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTicketDetails = createAsyncThunk(
  'tickets/fetchTicketDetails',
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.getTicketDetails(ticketId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTicketStatusAsync = createAsyncThunk(
  'tickets/updateTicketStatus',
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.updateTicketStatus(ticketId, status);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTicketPriorityAsync = createAsyncThunk(
  'tickets/updateTicketPriority',
  async ({ ticketId, priority }, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.updateTicketPriority(ticketId, priority);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignTicketAsync = createAsyncThunk(
  'tickets/assignTicket',
  async ({ ticketId, agentId }, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.assignTicket(ticketId, agentId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveTicketAsync = createAsyncThunk(
  'tickets/resolveTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.resolveTicket(ticketId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closeTicketAsync = createAsyncThunk(
  'tickets/closeTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await ticketAPI.closeTicket(ticketId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    items: [],
    selectedTicket: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    addTicket: (state, action) => {
      state.items.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tenant Tickets
    builder
      .addCase(fetchTenantTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTenantTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Customer Tickets
    builder
      .addCase(fetchCustomerTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCustomerTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Ticket Stats
    builder
      .addCase(fetchTicketStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTicketStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Ticket Details
    builder
      .addCase(fetchTicketDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTicketDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTicket = action.payload;
      })
      .addCase(fetchTicketDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Status
    builder
      .addCase(updateTicketStatusAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Update Priority
    builder
      .addCase(updateTicketPriorityAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Assign Ticket
    builder
      .addCase(assignTicketAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Resolve Ticket
    builder
      .addCase(resolveTicketAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Close Ticket
    builder
      .addCase(closeTicketAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { addTicket, clearError } = ticketSlice.actions;
export default ticketSlice.reducer;