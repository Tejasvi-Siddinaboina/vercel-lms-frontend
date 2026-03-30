import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api.js'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await authAPI.register({ fullName: form.fullName, email: form.email, password: form.password })
      const { token, ...user } = res.data.data
      localStorage.setItem('lms_token', token)
      localStorage.setItem('lms_user', JSON.stringify(user))
      setSuccess('Account created! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const s = styles
  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.icon}>📚</div>
          <h1 style={s.brandName}>LibraryMS</h1>
          <p style={s.brandDesc}>Join thousands of libraries running smarter with LibraryMS.</p>
        </div>
        <div>
          <p style={s.stepsLabel}>GET STARTED IN 3 STEPS</p>
          {[['01','Create your account'],['02','Add your books'],['03','Manage everything']].map(([n,t]) => (
            <div key={n} style={s.step}>
              <div style={s.stepNum}>{n}</div>
              <div style={s.stepText}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Create account</h2>
          <p style={s.subtitle}>Start your free LibraryMS account</p>

          {error   && <div style={s.err}>⚠ {error}</div>}
          {success && <div style={s.suc}>✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>FULL NAME</label>
              <input style={s.input} type="text" placeholder="John Doe"
                value={form.fullName} onChange={e => setForm({...form, fullName:e.target.value})} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>EMAIL ADDRESS</label>
              <input style={s.input} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div style={s.row}>
              <div style={{...s.field, flex:1}}>
                <label style={s.label}>PASSWORD</label>
                <input style={s.input} type="password" placeholder="Min 6 chars"
                  value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
              </div>
              <div style={{...s.field, flex:1}}>
                <label style={s.label}>CONFIRM</label>
                <input style={s.input} type="password" placeholder="Repeat"
                  value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} required />
              </div>
            </div>
            <button style={{...s.btn, opacity:loading?0.7:1}} type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>

          <p style={s.foot}>Already have an account? <Link to="/login" style={s.link}>Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display:'flex', minHeight:'100vh', background:'#0a0a0f', fontFamily:"'Jost',sans-serif" },
  left: {
    flex:1, padding:'64px 56px',
    background:'linear-gradient(145deg,#0f1320,#1c1828)',
    borderRight:'1px solid rgba(184,149,90,0.12)',
    display:'flex', flexDirection:'column', justifyContent:'center',
  },
  brand: { marginBottom:'48px' },
  icon: { fontSize:'48px', marginBottom:'14px' },
  brandName: {
    fontFamily:"'Cormorant Garamond',serif", fontSize:'46px', fontWeight:'700', margin:'0 0 12px',
    background:'linear-gradient(135deg,#d4a853,#f0d090)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
  },
  brandDesc: { color:'rgba(255,255,255,0.45)', fontSize:'15px', lineHeight:'1.7' },
  stepsLabel: { fontSize:'11px', fontWeight:'700', letterSpacing:'0.12em', color:'rgba(184,149,90,0.7)', marginBottom:'16px' },
  step: { display:'flex', gap:'14px', alignItems:'center', marginBottom:'16px' },
  stepNum: {
    width:'32px', height:'32px', borderRadius:'8px', flexShrink:0,
    background:'rgba(184,149,90,0.15)', border:'1px solid rgba(184,149,90,0.3)',
    color:'#b8955a', fontSize:'12px', fontWeight:'700',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  stepText: { color:'rgba(255,255,255,0.65)', fontSize:'14px' },
  right: { width:'500px', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 52px' },
  card: { width:'100%' },
  title: { fontFamily:"'Cormorant Garamond',serif", fontSize:'32px', fontWeight:'600', color:'#fffffe', margin:'0 0 8px' },
  subtitle: { color:'rgba(255,255,255,0.4)', fontSize:'14px', marginBottom:'28px' },
  err: {
    background:'rgba(220,60,60,0.1)', border:'1px solid rgba(220,60,60,0.3)',
    borderRadius:'10px', padding:'12px 16px', color:'#ff8080', fontSize:'14px', marginBottom:'16px',
  },
  suc: {
    background:'rgba(60,180,100,0.1)', border:'1px solid rgba(60,180,100,0.3)',
    borderRadius:'10px', padding:'12px 16px', color:'#70e0a0', fontSize:'14px', marginBottom:'16px',
  },
  row: { display:'flex', gap:'14px' },
  field: { marginBottom:'16px' },
  label: { display:'block', fontSize:'11px', fontWeight:'600', letterSpacing:'0.1em', color:'rgba(255,255,255,0.4)', marginBottom:'6px' },
  input: {
    width:'100%', padding:'13px 16px',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(184,149,90,0.2)',
    borderRadius:'10px', color:'#fffffe', fontSize:'14px', outline:'none',
    fontFamily:"'Jost',sans-serif",
  },
  btn: {
    width:'100%', padding:'14px', marginTop:'6px',
    background:'linear-gradient(135deg,#b8955a,#d4b070)',
    border:'none', borderRadius:'10px', color:'#0a0a0f',
    fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:"'Jost',sans-serif",
  },
  foot: { textAlign:'center', marginTop:'20px', color:'rgba(255,255,255,0.4)', fontSize:'14px' },
  link: { color:'#b8955a', textDecoration:'none', fontWeight:'500' },
}
