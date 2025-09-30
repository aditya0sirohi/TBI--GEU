import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- Configuration ---
// Define the base URL for the API. 
// In a real application, this should come from an environment variable.
const API_BASE_URL = 'http://localhost:5000'; // Replace with your actual backend URL

/**
 * A React component to find and add other users as friends.
 * It fetches a list of all users and provides a button to send a friend request.
 * Usernames are clickable links that navigate to the chat page for that user.
 */
const FindUsersPage = () => {
  // State to store the list of users fetched from the API
  const [users, setUsers] = useState([]);

  // Fetch all users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Construct the full URL for the API endpoint
        const response = await axios.get(`${API_BASE_URL}/api/auth/users`);
        // The API is expected to return an object with a 'users' key: { users: [...] }
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  /**
   * Handles sending a friend request to a user.
   * @param {string} friendId - The unique ID of the user to add as a friend.
   */
  const handleAddFriend = async (friendId) => {
    try {
      // Retrieve the JWT from local storage
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('Authentication token not found. Please log in.');
        alert('You must be logged in to add friends.');
        return;
      }

      // Make a POST request to the add-friend endpoint
      await axios.post(
        `${API_BASE_URL}/api/auth/add-friend/${friendId}`,
        {}, // The request body is empty as the friendId is in the URL
        {
          headers: {
            // Include the JWT in the Authorization header
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`Successfully sent friend request to user with ID: ${friendId}`);
      alert('Friend request sent!');
      // Optionally, you could update the UI to show the request is pending.

    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error('Error adding friend:', errorMessage);
      alert(`Failed to send friend request: ${errorMessage}`);
    }
  };
  
  // Basic inline styles for the component
  const styles = {
    container: {
      fontFamily: 'sans-serif',
      padding: '2rem',
      maxWidth: '700px',
      margin: '2rem auto',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    userList: {
      listStyle: 'none',
      padding: 0,
      marginTop: '1.5rem',
    },
    userItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: '1px solid #eee',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    profilePic: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    usernameLink: {
      fontWeight: 'bold',
      textDecoration: 'none',
      color: '#333',
    },
    addButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#007BFF',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s',
    }
  };

  return (
    <div style={styles.container}>
      <h2>Find New Friends 🤝</h2>
      {users.length > 0 ? (
        <ul style={styles.userList}>
          {users.map((user) => (
            <li key={user._id} style={styles.userItem}>
              <div style={styles.userInfo}>
                <img
                  src={user.profilePicture}
                  alt={`${user.username}'s profile`}
                  style={styles.profilePic}
                />
                <Link to={`/chat/${user._id}`} style={styles.usernameLink}>
                  {user.username}
                </Link>
              </div>
              <button
                onClick={() => handleAddFriend(user._id)}
                style={styles.addButton}
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading users or no users found.</p>
      )}
    </div>
  );
};

export default FindUsersPage;

