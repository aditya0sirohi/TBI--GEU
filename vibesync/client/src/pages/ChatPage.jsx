import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

/**
 * A self-contained component for the chat interface. It is defined
 * within ChatPage.jsx to avoid import issues.
 * In a real application, this would contain the logic for sending
 * and receiving messages.
 * @param {{userId: string}} props - The props object containing the userId.
 */
const ChatBox = ({ userId }) => {
  // Basic inline styles for the chat box container
  const styles = {
    chatBoxContainer: {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      height: '70vh',
      width: '100%',
      maxWidth: '800px',
      margin: '2rem auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#f9f9f9',
    },
    header: {
      paddingBottom: '10px',
      borderBottom: '1px solid #eee',
      marginBottom: '10px',
    },
    messages: {
      flexGrow: 1,
      overflowY: 'auto',
      marginBottom: '10px',
    },
    inputArea: {
      display: 'flex',
    },
    input: {
      flexGrow: 1,
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '20px',
    },
    button: {
      padding: '10px 20px',
      marginLeft: '10px',
      border: 'none',
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '20px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.chatBoxContainer}>
      <h3 style={styles.header}>Chat with User: {userId}</h3>
      <div style={styles.messages}>
        {/* Messages would be rendered here */}
        <p>This is the beginning of your chat history...</p>
      </div>
      <div style={styles.inputArea}>
        <input type="text" placeholder="Type a message..." style={styles.input} />
        <button style={styles.button}>Send</button>
      </div>
    </div>
  );
};


/**
 * A page component that displays a chat interface with a user.
 * It first verifies if the current user is friends with the user
 * specified in the URL parameter before rendering the ChatBox.
 */
const ChatPage = () => {
  // Get the userId from the URL (e.g., /chat/:userId)
  const { userId } = useParams();

  // State to track friendship status
  const [isFriend, setIsFriend] = useState(false);
  // State to handle the loading period while checking friendship
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs when the component mounts or when the userId changes
  useEffect(() => {
    const checkFriendship = async () => {
      // Reset state for new userId
      setIsLoading(true);
      setIsFriend(false);

      try {
        // Retrieve the JWT from local storage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found.');
          // If no token, they can't be friends, so stop loading
          setIsLoading(false);
          return;
        }

        // Make the API call to check the friendship status
        const response = await axios.get(
          `/api/auth/check-friendship/${userId}`,
          {
            headers: {
              // Include the JWT for authorization
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // The API should return a boolean, e.g., { isFriend: true }
        if (response.data && typeof response.data.isFriend === 'boolean') {
          setIsFriend(response.data.isFriend);
        }

      } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.error('Error checking friendship:', errorMessage);
        // On error, we assume they are not friends
        setIsFriend(false);
      } finally {
        // Stop the loading state regardless of the outcome
        setIsLoading(false);
      }
    };

    // Only run the check if a userId is present
    if (userId) {
      checkFriendship();
    } else {
      // If no userId in URL, stop loading
      setIsLoading(false);
    }

  }, [userId]); // Rerun the effect if the userId in the URL changes

  // Basic inline styles for the page container and messages
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'calc(100vh - 100px)', // Adjust height as needed
      fontFamily: 'sans-serif',
      color: '#333',
    },
    message: {
      padding: '2rem',
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }
  };

  // --- Conditional Rendering Logic ---

  // 1. Show a loading indicator while the friendship check is in progress
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>Loading...</div>
      </div>
    );
  }

  // 2. If loading is done and they are friends, show the chat interface
  if (isFriend) {
    return <ChatBox userId={userId} />;
  }

  // 3. If loading is done and they are not friends, show a restriction message
  return (
    <div style={styles.container}>
      <div style={styles.message}>
        <h2>Access Denied</h2>
        <p>You must be friends with this user to start a chat.</p>
      </div>
    </div>
  );
};

export default ChatPage;

