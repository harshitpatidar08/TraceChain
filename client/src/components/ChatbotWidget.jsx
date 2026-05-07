import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatbotWidget = ({ productContext = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', text: "Hello! I am TraceBot. Ask me anything about food safety or product tracking.\n(आप हिंदी में भी पूछ सकते हैं 🙏)" }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text = inputMsg) => {
    if (!text.trim()) return;

    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);
    setInputMsg('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const payload = {
        message: text,
        productContext,
        conversationHistory: history
      };

      // Depending on Auth Context, the user might not be logged in. Chatbot is public.
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...newMsgs, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages([...newMsgs, { role: 'assistant', text: "Oops, I encountered an error connecting to my brain." }]);
      }
    } catch (error) {
      setMessages([...newMsgs, { role: 'assistant', text: "Oops, network error occurred." }]);
    }
    setLoading(false);
  };

  const handleSuggest = (q) => {
    handleSend(q);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded State */}
      {isOpen && (
        <div className="bg-white text-gray-900 w-full max-w-[380px] h-[500px] mb-4 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-200 transition-all origin-bottom-right">
          
          <div className="bg-white text-gray-900 px-5 py-4 flex justify-between items-center z-10 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-orange-600" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">TraceBot</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Supply Chain Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end bg-orange-500 text-white rounded-2xl rounded-tr-sm shadow-orange-200 shadow-md' : 'self-start bg-white border border-slate-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'} p-3 text-sm`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            ))}
            
            {loading && (
              <div className="self-start bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
            
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 mt-4 absolute bottom-[80px] p-2 max-w-[370px]">
                {["Is this product safe?", "What does trust score mean?", "यह उत्पाद कहाँ से आया?", "Why is this in caution?"].map(q => (
                  <button key={q} onClick={() => handleSuggest(q)} className="bg-white border border-orange-200 text-orange-600 text-[11px] px-3 py-1.5 rounded-full hover:bg-orange-50 font-medium transition-colors shadow-sm">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input 
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button 
                type="submit" disabled={!inputMsg.trim() || loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white p-2.5 rounded-full transition-all flex items-center justify-center min-w-[40px] shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Collapsed Button */}
      {!isOpen && (
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping" />
          <motion.button
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 
              bg-gradient-to-r from-orange-500 to-amber-400
              rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)]
              text-white font-semibold text-sm relative z-10 transition-shadow hover:shadow-[0_0_30px_rgba(249,115,22,0.8)]"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles size={18} />
            </motion.div>
            <span>Ask AI</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;