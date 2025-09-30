import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('')
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', form)
      setStatus('Logged in')
      // Optionally store token
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
      }
      setForm({ email: '', password: '' })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setStatus('Login failed')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}


