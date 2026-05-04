
import React, { useState, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversations, fetchConversationMessages, sendMessageAsync, setActiveConversation } from '../../Faetures/messages/messagesSlice';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation, messages, loading } = useSelector((state) => state.messages);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (activeConversation?.id) {
      dispatch(fetchConversationMessages(activeConversation.id));
    }
  }, [activeConversation, dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !activeConversation) {
      toast.error('Please select a conversation and type a message');
      return;
    }

    setIsSending(true);
    const toastId = toast.loading('Sending message...');

    try {
      // Send user message
      await dispatch(sendMessageAsync({
        conversationId: activeConversation.id,
        content: inputMessage,
        senderType: 'customer'
      }));

      // Get AI response
      try {
        const response = await aiAPI.getAIResponse(inputMessage);
        const aiMessage = {
          conversationId: activeConversation.id,
          content: response.data.aiResponse,
          senderType: 'ai',
          timestamp: new Date()
        };
        setAiResponse(aiMessage);
        
        // Optionally send AI response as a message
        await dispatch(sendMessageAsync(aiMessage));
      } catch (aiError) {
        console.log('AI response failed, but user message was sent');
      }

      setInputMessage('');
      toast.success('Message sent!', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to send message', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const displayMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      
      {/* Left Sidebar: Conversations */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Active Chats</h2>
          <p className="text-sm text-gray-400 mt-1">{conversations.length} conversations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-gray-400 text-sm">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            conversations.map((chat) => (
              <div 
                key={chat._id || chat.id}
                onClick={() => dispatch(setActiveConversation(chat))}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  activeConversation?._id === chat._id || activeConversation?.id === chat.id 
                    ? 'bg-gray-50 border-r-4 border-black' 
                    : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white shrink-0">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 truncate">{chat.customerName || 'Unknown'}</h4>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate">{chat.subject || chat.lastMessage || 'No messages'}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-400 text-sm">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{activeConversation.customerName || 'Customer'}</h3>
                <p className="text-xs text-emerald-500 font-medium">Active now</p>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 space-y-6">
              {loading ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : displayMessages.length > 0 ? (
                displayMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                    {msg.senderType !== 'customer' && (
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
                        <Bot size={14} />
                      </div>
                    )}
                    <div className="space-y-1 max-w-[70%]">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.senderType === 'customer' 
                          ? 'bg-black text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                    {msg.senderType === 'customer' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              {aiResponse && (
                <div className="flex justify-start items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
                    <Bot size={14} />
                  </div>
                  <div className="space-y-1 max-w-[70%]">
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none text-sm text-gray-700 shadow-sm leading-relaxed">
                      {aiResponse.content}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-100">
              <form onSubmit={handleSendMessage}>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isSending}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                <Bot size={12} className="text-orange-500" />
                AI Assistant is suggesting responses
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
