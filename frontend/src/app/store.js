import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Faetures/auth/auth.slice";
import ticketReducer from "../Faetures/tickets/ticketSlice"
import messagesReducer from "../Faetures/messages/messagesSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    messages: messagesReducer,
  },
});