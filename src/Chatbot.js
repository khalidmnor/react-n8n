import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid'
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const predefinedButtons = [
  { label: "Help", icon: "🆘" },
];

// Replace with your n8n webhook URL
const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL;
// const N8N_WEBHOOK_URL = 'https://a7c5-2001-d08-2295-4516-38f6-6b18-1829-7073.ngrok-free.app/webhook-test/d6ede216-4344-48f9-9891-13905e450710';
const sessionId = uuid();


const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hello! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (msg) => {
    const messageToSend = msg || input;
    if (!messageToSend.trim()) return;
    setInput('');
    setIsTyping(true);

    const newMessages = [...messages, { sender: 'user', text: messageToSend }];
    setMessages(newMessages);

    try {
      const response = await axios.post(N8N_WEBHOOK_URL, {
        message: messageToSend,
        sessionId: sessionId,
      });

      const botMessage = response.data.output || '🤖 Sorry, I didn’t get that.';
      const xbotMessage = botMessage.replaceAll('\n\n\n', '\n\n');
      setIsTyping(false);
      setMessages([...newMessages, { sender: 'bot', text: xbotMessage }]);
    } catch (error) {
      console.error('Error communicating with n8n:', error);
      setIsTyping(false);
      setMessages([...newMessages, { sender: 'bot', text: '⚠️ Server error.' }]);
    }

    setInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
      <div>
        {/* Toggle Button */}
        <div onClick={() => setIsOpen(!isOpen)} style={styles.floatingButton}>
          💬
        </div>

        {/* Chat Widget */}
        {isOpen && (
            <div style={styles.chatWidget}>
              <div style={styles.chatHeader}>
                <span>🤖 MITI AP Registration Chatbot</span>
                <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✖</button>
              </div>

              <div style={styles.chatWindow}>

                <div style={styles.botHeader}>
                  <img
                      src="chatbot.png"
                      alt="Amin Razak The Bot"
                      style={styles.botAvatar}
                  />
                  <div>
                    <div style={styles.botName}>Amin Razak The Bot</div>
                    <div style={styles.botStatus}>On Gout Leave</div>
                  </div>
                </div>

                <div style={styles.chatBody}>
                  {messages.map((msg, idx) => (
                      <div
                          key={idx}
                          style={{
                            ...styles.message,
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.sender === 'user' ? '#007bff' : '#e0e0e0',
                            color: msg.sender === 'user' ? '#fff' : '#000',
                          }}
                      >
                        {msg.sender === 'bot' ? (
                            <ReactMarkdown
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ borderRadius: '10px', padding: '10px' }}
                                            {...props}
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code
                                            style={{
                                              backgroundColor: '#f5f5f5',
                                              padding: '2px 4px',
                                              borderRadius: '4px',
                                              fontSize: '90%',
                                            }}
                                            {...props}
                                        >
                                          {children}
                                        </code>
                                    );
                                  },
                                }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                      </div>
                  ))}

                  {isTyping && (
                      <div
                          style={{
                            ...styles.message,
                            alignSelf: 'flex-start',
                            backgroundColor: '#e0e0e0',
                            color: '#000',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                      >
                        <div style={styles.spinner} />
                        <span>Thinking ...</span>
                      </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

              </div>

              <div style={styles.quickReplies}>
                <div style={styles.quickRepliesScroll}>
                  {predefinedButtons.map(({ label, icon }, idx) => (
                      <button
                          key={idx}
                          style={styles.quickButton}
                          onClick={() => sendMessage(label)}
                          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <span style={{ marginRight: '6px' }}>{icon}</span>
                        {label}
                      </button>
                  ))}
                </div>
              </div>

              <div style={styles.inputArea}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <button onClick={() => sendMessage()} style={styles.sendButton}>➤</button>
              </div>
            </div>
        )}
      </div>
  );
};

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#007bff',
    color: '#fff',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  chatWidget: {
    position: 'fixed',
    bottom: '100px',
    right: '30px',
    width: '450px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
  },
  chatHeader: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
  },
  chatWindow: {
    height: '60vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '10px',
  },
  message: {
    maxWidth: '85%',
    padding: '10px 10px',
    borderRadius: '20px',
    fontSize: '14px',
    lineHeight: '1.5',
    textAlign: 'left', // ← This aligns text inside the bubble
    wordBreak: 'break-word', // Prevent overflow on long words
    // whiteSpace: 'pre-wrap',
  },
  quickReplies: {
    padding: '10px',
    overflow: 'hidden',
    borderTop: '1px solid #eee',
  },
  quickRepliesScroll: {
    display: 'flex',
    flexWrap: 'wrap', // ✅ enables wrapping
    gap: '8px',
    justifyContent: 'flex-start',
  },
  quickButton: {
    backgroundColor: '#f1f1f1',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.1s ease-in-out',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '10px',
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '30px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  sendButton: {
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    fontSize: '18px',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
  },
  botHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f9f9f9',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  botAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
  },
  botName: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  botStatus: {
    fontSize: '12px',
    color: 'red',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ccc',
    borderTop: '2px solid #333',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default Chatbot;
