import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Bot, User } from 'lucide-react';

const GetHelp = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "hii", sender: "user", time: "10:06" },
    { id: 2, text: "Thank you for reaching out. I've created a support ticket (#12454) for your inquiry. A member of our team will review your request and respond within 2 hours. Is there anything else I can help you with?", sender: "bot", time: "10:06" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  

  const fileInputRef = useRef(null);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;


    const userMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    setMessages([...messages, userMsg]);
    setInput("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6] p-0 sm:p-6">
      <div className="w-full max-w-[950px] bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-screen sm:h-[85vh]">
        
        <div className="bg-gradient-to-r from-[#0a0a0f] via-[#5e1a0a] to-[#e64a19] p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-[#1e1e26] p-2.5 rounded-xl border border-white/10">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-[15px] sm:text-lg tracking-tight">AI Support Assistant</h2>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-[11px] sm:text-xs font-light">Always here to help • Average response time: 30 seconds</p>
              </div>
            </div>
          </div>
        </div>


        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-white scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3 group`}>
              

              {msg.sender === 'bot' && (
                <div className="bg-[#ff4500] p-2 rounded-full text-white mb-6 hidden sm:flex shadow-sm">
                  <Bot size={16} />
                </div>
              )}


              <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                <div className={`px-4 py-3 rounded-2xl text-sm sm:text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                  ? 'bg-black text-white rounded-br-none' 
                  : 'bg-[#f0f2f5] text-[#1c1e21] rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>
                </div>
    
                <span className="text-[10px] mt-1.5 text-gray-400 px-1 font-medium">{msg.time}</span>
              </div>

   
              {msg.sender === 'user' && (
                <div className="bg-gray-100 border border-gray-200 p-2 rounded-full text-gray-600 mb-6 hidden sm:flex shadow-sm">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>


        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 mt-auto">
          <form onSubmit={handleSend} className="relative flex items-center gap-3 bg-[#f8f9fa] rounded-xl border border-gray-200 p-2 focus-within:border-orange-400 transition-all shadow-inner">

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => console.log('File selected:', e.target.files[0]?.name)} 
            />

            <button 
              type="button" 
              onClick={handleAttachmentClick}
              className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
            >
              <Paperclip size={20} />
            </button>
            
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-gray-700 outline-none"
            />

            <button 
              type="submit"
              disabled={!input.trim()}
              className={`p-2.5 rounded-lg transition-all ${
                input.trim() ? 'bg-black text-white shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          <div className="mt-3.5 flex items-center justify-between px-1">
            <p className="text-[10px] text-gray-400 font-medium">Press Enter to send • Powered by AI</p>
            <div className="h-[1px] flex-1 bg-gray-100 ml-4 hidden sm:block"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetHelp;