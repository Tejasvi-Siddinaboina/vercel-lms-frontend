import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api.js'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await authAPI.login(form)
      const { token, ...user } = res.data.data
      localStorage.setItem('lms_token', token)
      localStorage.setItem('lms_user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const s = styles
  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.icon}>📚</div>
          <h1 style={s.brandName}>LibraryMS</h1>
          <p style={s.brandDesc}>Modern library management made simple and elegant.</p>
        </div>
        <div style={s.features}>
          {['📖 Complete Book Catalog', '👥 Member Management', '🔄 Borrow & Return Tracking', '📊 Live Dashboard Analytics'].map(f => (
            <div key={f} style={s.feat}>{f}</div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.subtitle}>Sign in to your LibraryMS account</p>

          {error && <div style={s.err}>⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>EMAIL</label>
              <input style={s.input} type="email" placeholder="admin@library.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>PASSWORD</label>
              <input style={s.input} type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button style={{...s.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={s.demo}>
            <span style={{color:'rgba(255,255,255,0.35)', fontSize:'12px'}}>Demo: </span>
            <span style={{color:'#b8955a', fontSize:'12px'}}>admin@library.com / admin123</span>
          </div>

          <p style={s.foot}>No account? <Link to="/register" style={s.link}>Register here</Link></p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display:'flex', minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Jost',sans-serif" },
  left: {
    flex:1, padding:'64px 56px',
    background:'linear-gradient(145deg,#0e0d1a,#1a1828)',
    borderRight:'1px solid rgba(184,149,90,0.12)',
    display:'flex', flexDirection:'column', justifyContent:'center',
  },
  brand: { marginBottom:'52px' },
  icon: { fontSize:'52px', marginBottom:'16px' },
  brandName: {
    fontFamily:"'Cormorant Garamond',serif", fontSize:'50px', fontWeight:'700', margin:'0 0 14px',
    background:'linear-gradient(135deg,#d4a853,#f0d090)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
  },
  brandDesc: { color:'rgba(255,255,255,0.45)', fontSize:'16px', lineHeight:'1.7' },
  features: { display:'flex', flexDirection:'column', gap:'12px' },
  feat: {
    padding:'13px 16px', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(184,149,90,0.1)', borderRadius:'10px',
    color:'rgba(255,255,255,0.6)', fontSize:'15px',
  },
  right: {
    width:'460px', display:'flex', alignItems:'center',
    justifyContent:'center', padding:'40px 48px',
  },
  card: { width:'100%' },
  title: { fontFamily:"'Cormorant Garamond',serif", fontSize:'34px', fontWeight:'600', color:'#fffffe', margin:'0 0 8px' },
  subtitle: { color:'rgba(255,255,255,0.4)', fontSize:'14px', marginBottom:'32px' },
  err: {
    background:'rgba(220,60,60,0.1)', border:'1px solid rgba(220,60,60,0.3)',
    borderRadius:'10px', padding:'12px 16px', color:'#ff8080', fontSize:'14px', marginBottom:'20px',
  },
  field: { marginBottom:'18px' },
  label: { display:'block', fontSize:'11px', fontWeight:'600', letterSpacing:'0.1em', color:'rgba(255,255,255,0.4)', marginBottom:'7px' },
  input: {
    width:'100%', padding:'14px 16px',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(184,149,90,0.2)',
    borderRadius:'10px', color:'#fffffe', fontSize:'15px', outline:'none',
    fontFamily:"'Jost',sans-serif",
  },
  btn: {
    width:'100%', padding:'15px', marginTop:'8px',
    background:'linear-gradient(135deg,#b8955a,#d4b070)',
    border:'none', borderRadius:'10px', color:'#0a0a0f',
    fontSize:'15px', fontWeight:'600', cursor:'pointer',
    fontFamily:"'Jost',sans-serif",
  },
  demo: {
    textAlign:'center', marginTop:'20px', padding:'10px',
    background:'rgba(184,149,90,0.07)', borderRadius:'8px',
    border:'1px solid rgba(184,149,90,0.15)',
  },
  foot: { textAlign:'center', marginTop:'20px', color:'rgba(255,255,255,0.4)', fontSize:'14px' },
  link: { color:'#b8955a', textDecoration:'none', fontWeight:'500' },
}
