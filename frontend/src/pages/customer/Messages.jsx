import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import chatService from '../../services/chatService';
import { Send, Upload, X, MessageSquare, RefreshCw } from 'lucide-react';

const Messages = () => {
  const { state } = useLocation();
  const initialSubject = state?.initialSubject;

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatService.getConversations();
        const data = response.data || response;
        setConversations(data);
        if (data.length > 0) {
          handleSelectConversation(data[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    try {
      const response = await chatService.getConversation(conv.uuid);
      setMessages(response.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      const response = await chatService.sendMessage({
        body,
        attachments,
      });
      setMessages(prev => [...prev, response.data || response]);
      setBody('');
      setAttachments([]);
    } catch (e) {
      console.error(e);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files].slice(0, 3));
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm h-[600px] flex transition-colors">
      
      {/* 1. Conversations Sidebar list */}
      <aside className="w-1/3 border-r border-secondary-200 dark:border-secondary-800 flex flex-col h-full bg-secondary-50/50 dark:bg-secondary-900/50">
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
          <h2 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" /> Support Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-secondary-100 dark:divide-secondary-800">
          {loading ? (
            <div className="p-4 text-center text-xs text-secondary-500">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-secondary-500">No active support conversations.</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id || conv.uuid}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full text-left p-4 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors flex flex-col gap-1 ${selectedConv?.id === conv.id ? 'bg-secondary-100 dark:bg-secondary-805' : ''}`}
              >
                <span className="font-semibold text-sm text-secondary-900 dark:text-white truncate">
                  {conv.subject || 'Support Ticket'}
                </span>
                <span className="text-xxs text-secondary-400">Status: {conv.status || 'Open'}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* 2. Message History Chat Log */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-secondary-900">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-secondary-50/50 dark:bg-secondary-900/50">
              <h3 className="font-bold text-sm text-secondary-900 dark:text-white">{selectedConv.subject || 'Support Conversation'}</h3>
            </div>

            {/* Messages log list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="text-center text-xs text-secondary-500">Loading messages...</div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id !== selectedConv.admin_id; // Check if sender matches customer id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm ${isMe ? 'bg-primary-500 text-white rounded-tr-none shadow-sm shadow-primary-900/10' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 rounded-tl-none'}`}>
                        {msg.body && <p className="leading-relaxed">{msg.body}</p>}
                        
                        {/* Attachments if present */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((file, fidx) => (
                              <a
                                key={fidx}
                                href={file.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xxs underline opacity-90 truncate max-w-xs"
                              >
                                📎 {file.name || 'Attachment'}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input form */}
            <form onSubmit={handleSend} className="p-4 border-t border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/50 space-y-2">
              
              {/* Attachments previews */}
              {attachments.length > 0 && (
                <div className="flex gap-2 pb-2">
                  {attachments.map((file, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-secondary-200 dark:bg-secondary-800 text-xxs px-2 py-0.5 rounded-full">
                      <span className="truncate max-w-[100px]">{file.name}</span>
                      <button type="button" onClick={() => handleRemoveAttachment(idx)}><X className="w-3 h-3 text-secondary-500" /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-center">
                <label className="p-2 text-secondary-500 hover:bg-secondary-250 dark:hover:bg-secondary-800 rounded-full cursor-pointer transition-colors flex-shrink-0">
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentChange}
                    className="sr-only"
                  />
                </label>
                <input
                  type="text"
                  placeholder="Type a support message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="flex-grow p-2.5 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-850 text-secondary-900 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors flex-shrink-0 active:scale-95 shadow"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col justify-center items-center text-center p-8 space-y-4">
            <MessageSquare className="w-12 h-12 text-secondary-300" />
            <h3 className="font-bold text-secondary-900 dark:text-white">Start a Support Conversation</h3>
            <p className="text-xs text-secondary-500 max-w-xs">
              Select an existing chat or submit an inquiry to speak directly with our team.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
export { Messages };
