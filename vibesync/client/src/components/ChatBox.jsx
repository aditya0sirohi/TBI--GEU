// src/components/ChatBox.jsx

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// This variable will hold the single socket connection instance.
// It's defined outside the component to persist across re-renders.
let socket;

const ChatBox = () => {
  // State to hold the list of messages
  const [messages, setMessages] = useState([]);
  // State for the new message input field
  const [newMessage, setNewMessage] = useState('');

  // useEffect hook to manage the socket connection lifecycle
  useEffect(() => {
    // Establish a connection to the Socket.IO server.
    // This runs once when the component mounts.
    socket = io('http://localhost:5001');

    // Set up a listener for the 'chat message' event from the server.
    socket.on('chat message', (msg) => {
      // When a message is received, add it to the messages array.
      // We use a functional update to correctly handle the previous state.
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // The cleanup function returned by useEffect.
    // This will be called when the component is unmounted.
    return () => {
      // Disconnect the socket to prevent memory leaks and unnecessary connections.
      socket.disconnect();
    };
  }, []); // The empty dependency array [] ensures this effect runs only on mount and unmount.

  /**
   * Handles the form submission to send a new message.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const sendMessage = (e) => {
    e.preventDefault(); // Prevent the default form submission (page reload).
    
    // Ensure the message isn't just empty spaces before sending.
    if (newMessage.trim()) {
      // Emit a 'chat message' event to the server with the message content.
      socket.emit('chat message', newMessage);
      // Clear the input field after the message is sent.
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h2>Live Chat 💬</h2>
      
      {/* Message Display Area */}
      <div className="message-display-area">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
      </div>
      
      {/* Message Input Form */}
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          autoComplete="off"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;