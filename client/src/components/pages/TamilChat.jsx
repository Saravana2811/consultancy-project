import { useState, useEffect, useRef } from 'react';
import './TamilChat.css';

const TamilChat = ({ userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatId = useRef(null);
  const prevMessageCountRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);

  // Tamil quick responses
  const quickResponses = [
    'வணக்கம்',
    'நன்றி',
    'உதவி வேண்டும்',
    'விலை என்ன?',
    'இது கிடைக்குமா?',
    'டெலிவரி எவ்வளவு நாள்?'
  ];

  useEffect(() => {
    if (isOpen) {
      shouldAutoScrollRef.current = true; // Enable auto-scroll when opening chat
      fetchChat();
      const interval = setInterval(fetchChat, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    // Only auto-scroll if there are new messages and user hasn't scrolled up
    if (messages.length > prevMessageCountRef.current && shouldAutoScrollRef.current) {
      scrollToBottom();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // If user is within 100px of bottom, enable auto-scroll
      shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/user/${userId}?userName=${encodeURIComponent(userName)}`);
      const data = await response.json();
      chatId.current = data._id;
      setMessages(data.messages || []);
      
      // Mark admin messages as read
      if (data.messages?.some(msg => msg.sender === 'admin' && !msg.read)) {
        await fetch(`http://localhost:5000/api/chat/${data._id}/read`, {
          method: 'PUT'
        });
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setLoading(true);
    shouldAutoScrollRef.current = true; // Always scroll when user sends a message
    try {
      const response = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userName,
          text: text.trim(),
          sender: 'user'
        })
      });

      const data = await response.json();
      setMessages(data.messages || []);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleQuickResponse = (text) => {
    sendMessage(text);
  };

  const unreadCount = messages.filter(msg => msg.sender === 'admin' && !msg.read).length;

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className="tamil-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="உரையாடல்"
      >
        💬
        {unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="tamil-chat-window">
          <div className="tamil-chat-header">
            <div>
              <h3>உரையாடல்</h3>
              <p className="chat-subtitle">வாடிக்கையாளர் ஆதரவு</p>
            </div>
            <button 
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div 
            className="tamil-chat-messages" 
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <p>வணக்கம்! 👋</p>
                <p className="chat-welcome-sub">உங்களுக்கு எவ்வாறு உதவ முடியும்?</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'admin-message'}`}
                >
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          <div className="tamil-quick-responses">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                className="quick-response-btn"
                onClick={() => handleQuickResponse(response)}
                disabled={loading}
              >
                {response}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <form className="tamil-chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="செய்தியை தட்டச்சு செய்யவும்..."
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !newMessage.trim()}
              className="send-btn"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default TamilChat;
