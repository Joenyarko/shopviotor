import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, RefreshCw, User, Sparkles } from 'lucide-react';
import apiClient from '../api/client';

const INITIAL_MESSAGE = {
  id: 'init-1',
  role: 'assistant',
  content: 'Hi there! 👋 I am Vee, the VIOTOR AI Assistant. I can help you with questions about products, ordering, layaways, raffles, and more. How can I help you today?',
  created_at: new Date().toISOString(),
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [open, messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    
    setSending(true);
    
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: newMsg,
      created_at: new Date().toISOString(),
    };
    
    // Update local state optimistic UI
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setNewMsg('');
    scrollToBottom();
    
    try {
      // Send conversation history to the AI (filter out local IDs and timestamps)
      const payloadMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await apiClient.post('/ai/chat', { messages: payloadMessages });
      
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply || res.reply,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      
      if (!open) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: err.response?.data?.reply || "I'm having trouble connecting right now. Please try again or contact support on WhatsApp.",
        created_at: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {/* Toggle Button - stacked above WhatsApp CTA (bottom-right) */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-secondary-900 dark:bg-secondary-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open AI Assistant"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-44 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '65vh' }}>

          {/* Header */}
          <div className="bg-secondary-900 dark:bg-secondary-950 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Vee — AI Assistant</p>
              <p className="text-secondary-400 text-xs">Replies instantly ⚡</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-secondary-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary-50 dark:bg-secondary-950/50">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                  {!isUser && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.isError ? 'bg-red-500' : 'bg-primary-500'}`}>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    isUser
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : msg.isError 
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-bl-none'
                        : 'bg-white dark:bg-secondary-800 text-secondary-800 dark:text-secondary-100 border border-secondary-200 dark:border-secondary-700 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                    <p className={`text-[10px] mt-1.5 ${isUser ? 'text-primary-200' : msg.isError ? 'text-red-400' : 'text-secondary-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {isUser && (
                    <div className="w-7 h-7 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-secondary-500 dark:text-secondary-400" />
                    </div>
                  )}
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-4 py-3 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-secondary-200 dark:border-secondary-800 flex items-center gap-2 bg-white dark:bg-secondary-900">
            <input
              type="text"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Ask Vee anything..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMsg.trim()}
              className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
