import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FindUsersPage from './pages/FindUsersPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios
      .get('http://localhost:5001/api')
      .then((res) => {
        setMessage(res.data?.message ?? '')
      })
      .catch((err) => {
        console.error('Failed to fetch message:', err)
      })
  }, [])

  return (
    <div>
      <h1>VibeSync</h1>
      <button>Fetch Message</button>
      <p>{message}</p>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<FindUsersPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
      </Routes>
    </div>
  )
}

export default App
