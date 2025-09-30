import { Link } from 'react-router-dom'

export default function Navbar() {
  const navStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
  }

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    padding: '6px 10px',
    borderRadius: '4px',
  }

  const linkHoverStyle = {
    background: '#e9e9e9',
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle} onMouseOver={(e) => (e.currentTarget.style.background = linkHoverStyle.background)} onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
        Home
      </Link>
      <Link to="/login" style={linkStyle} onMouseOver={(e) => (e.currentTarget.style.background = linkHoverStyle.background)} onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
        Login
      </Link>
      <Link to="/register" style={linkStyle} onMouseOver={(e) => (e.currentTarget.style.background = linkHoverStyle.background)} onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
        Register
      </Link>
    </nav>
  )
}


