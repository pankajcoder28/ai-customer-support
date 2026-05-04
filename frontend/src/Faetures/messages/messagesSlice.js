import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../services/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversations();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversationMessages = createAsyncThunk(
  'messages/fetchConversationMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversationMessages(conversationId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConversationAsync = createAsyncThunk(
  'messages/createConversation',
  async (conversationData, { rejectWithValue }) => {
    try {
      const response = await messageAPI.createConversation(conversationData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessageAsync = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage(messageData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closeConversationAsync = createAsyncThunk(
  'messages/closeConversation',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.closeConversation(conversationId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Conversation Messages
    builder
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Conversation
    builder
      .addCase(createConversationAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createConversationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
        state.activeConversation = action.payload;
      })
      .addCase(createConversationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Send Message
    builder
      .addCase(sendMessageAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Close Conversation
    builder
      .addCase(closeConversationAsync.fulfilled, (state, action) => {
        const index = state.conversations.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
      });
  },
});

export const { setActiveConversation, clearError } = messagesSlice.actions;
export default messagesSlice.reducer;
