import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

export default function DashboardPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [songs, setSongs] = useState([])
  const audioRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    axios
      .get('http://localhost:5001/api/songs/mysongs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSongs(res.data?.songs || []))
      .catch((err) => console.error('Failed to fetch songs', err))
  }, [])

  function handleFileChange(e) {
    setFile(e.target.files?.[0] || null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('')
    if (!file) {
      setStatus('Please choose a file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('song', file)

      const token = localStorage.getItem('token')

      const res = await axios.post('http://localhost:5001/api/songs/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setStatus('Upload successful')
      setFile(null)
      console.log('Upload response:', res.data)
      // Refresh list after upload
      try {
        const refreshed = await axios.get('http://localhost:5001/api/songs/mysongs', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSongs(refreshed.data?.songs || [])
      } catch (e) {
        console.error('Failed to refresh songs', e)
      }
    } catch (err) {
      console.error(err)
      setStatus('Upload failed')
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {status && <p>{status}</p>}
      <h3>Your Songs</h3>
      <ul>
        {songs.map((s) => (
          <li key={s._id}>
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.src = s.songUrl
                  audioRef.current.play().catch(() => {})
                }
              }}
            >
              {s.title || 'Untitled'}
            </button>
          </li>
        ))}
      </ul>
      <audio ref={audioRef} controls style={{ marginTop: '12px', width: '100%' }} />
    </div>
  )
}


