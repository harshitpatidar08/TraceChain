import React, {
  useState,
  useRef,
  useEffect
} from 'react';

import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles
} from 'lucide-react';

import {
  motion,
  AnimatePresence
} from 'framer-motion';

const ChatbotWidget = ({
  productContext = null
}) => {
  const [isOpen, setIsOpen] =
    useState(false);

  const [messages, setMessages] =
    useState([]);

  const [inputMsg, setInputMsg] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    if (
      isOpen &&
      messages.length === 0
    ) {
      setMessages([
        {
          role: 'assistant',
          text:
            'Hello! I am TraceBot. Ask me anything about food safety or product tracking.\n(आप हिंदी में भी पूछ सकते हैं 🙏)'
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);

  const handleSend = async (
    text = inputMsg
  ) => {
    if (!text.trim()) return;

    const newMsgs = [
      ...messages,
      {
        role: 'user',
        text
      }
    ];

    setMessages(newMsgs);
    setInputMsg('');
    setLoading(true);

    try {
      const history = messages.map(
        (m) => ({
          role: m.role,
          content: m.text
        })
      );

      const payload = {
        message: text,
        productContext,
        conversationHistory: history
      };

      const baseUrl = import.meta.env.MODE === 'production' ? (import.meta.env.VITE_API_BASE_URL || '') : 'http://localhost:5000';

      const res = await fetch(
        `${baseUrl}/api/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text: data.reply
          }
        ]);
      } else {
        console.error('Chatbot API error:', data);
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            text:
              `Sorry, something went wrong (${res.status}). Please try again.`
          }
        ]);
      }
    } catch (error) {
      console.error('Chatbot fetch error:', error);
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text:
            'Could not reach the server. Make sure the backend is running, then try again.'
        }
      ]);
    }

    setLoading(false);
  };

  const handleSuggest = (q) => {
    handleSend(q);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">

      {/* Chat Window */}

      <AnimatePresence>

        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.95
            }}
            transition={{
              duration: 0.25
            }}
            className="w-[380px] h-[620px] bg-white border border-slate-200 rounded-[36px] shadow-2xl overflow-hidden flex flex-col mb-4"
          >

            {/* Header */}

            <div className="relative px-6 py-5 border-b border-slate-100 bg-white">

              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

              <div className="relative flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-[20px] bg-emerald-100 flex items-center justify-center shadow-sm relative">

                    <Bot className="w-7 h-7 text-emerald-600" />

                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />

                  </div>

                  <div>

                    <h3 className="text-xl font-black text-slate-900">

                      TraceBot

                    </h3>

                    <div className="flex items-center gap-2 mt-1">

                      <Sparkles className="w-3 h-3 text-orange-500" />

                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">

                        AI Supply Assistant

                      </p>

                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setIsOpen(false)
                  }
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                >

                  <X className="w-5 h-5 text-slate-700" />

                </button>

              </div>
            </div>

            {/* Messages */}

            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-5 py-5 space-y-4">

              {messages.map(
                (msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
                      className={`max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white rounded-br-md'
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                      }`}
                    >

                      {msg.text}

                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex justify-start">

                  <div className="bg-white border border-slate-200 rounded-[24px] rounded-bl-md px-5 py-4 shadow-sm">

                    <div className="flex gap-2">

                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />

                      <div
                        className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                        style={{
                          animationDelay:
                            '0.1s'
                        }}
                      />

                      <div
                        className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                        style={{
                          animationDelay:
                            '0.2s'
                        }}
                      />

                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}

              {messages.length === 1 &&
                !loading && (
                  <div className="flex flex-wrap gap-2 pt-3">

                    {[
                      'Is this product safe?',
                      'What does trust score mean?',
                      'यह उत्पाद कहाँ से आया?',
                      'Why is this in caution?'
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() =>
                          handleSuggest(q)
                        }
                        className="bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full transition-all"
                      >

                        {q}

                      </button>
                    ))}

                  </div>
                )}

              <div ref={endRef} />

            </div>

            {/* Input */}

            <div className="p-4 bg-white border-t border-slate-100">

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >

                <input
                  value={inputMsg}
                  onChange={(e) =>
                    setInputMsg(
                      e.target.value
                    )
                  }
                  placeholder="Ask something..."
                  className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                />

                <button
                  type="submit"
                  disabled={
                    !inputMsg.trim() ||
                    loading
                  }
                  className="w-14 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white flex items-center justify-center transition-all"
                >

                  <Send className="w-5 h-5" />

                </button>

              </form>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Floating Button */}

      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="relative w-16 h-16 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white shadow-2xl flex items-center justify-center overflow-hidden border border-slate-700"
        >

          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-orange-400/20" />

          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-[24px] border border-emerald-400/30 animate-ping" />

          {/* Icon */}
          <MessageCircle className="w-7 h-7 relative z-10" />

        </motion.button>
      )}
      
    </div>
  );
};

export default ChatbotWidget;