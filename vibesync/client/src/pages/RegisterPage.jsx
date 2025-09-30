import { useState } from 'react'
import axios from 'axios'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [status, setStatus] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('')
    try {
      await axios.post('http://localhost:5001/api/auth/register', form)
      setStatus('Registered successfully')
      setForm({ username: '', email: '', password: '' })
    } catch (err) {
      console.error(err)
      setStatus('Registration failed')
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>
        </div>
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
        <button type="submit">Register</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}


