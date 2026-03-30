import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookAPI } from '../services/api.js'

const EMPTY = { title:'', author:'', isbn:'', category:'', publisher:'', publishYear:2024, totalCopies:1, availableCopies:1 }

export default function DashboardPage() {
  const [tab, setTab] = useState('overview')
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState({})
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  // ✨ AI states
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('lms_user') || '{}')

  const showToast = (msg, type='success') => {
    setToast({msg, type})
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([bookAPI.getAll(), bookAPI.stats()])
      setBooks(b.data.data || [])
      setStats(s.data.data || {})
    } catch {}
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const logout = () => { localStorage.clear(); navigate('/login') }

  // ✨ Reset aiSummary when opening modal
  const openAdd = () => { setEditTarget(null); setForm(EMPTY); setFormErr(''); setAiSummary(''); setModal(true) }
  const openEdit = (b) => { setEditTarget(b); setForm({...b}); setFormErr(''); setAiSummary(''); setModal(true) }

  const handleSave = async () => {
    if (!form.title || !form.author) { setFormErr('Title and author are required'); return }
    setSaving(true); setFormErr('')
    try {
      if (editTarget) await bookAPI.update(editTarget.id, form)
      else await bookAPI.add(form)
      showToast(editTarget ? 'Book updated!' : 'Book added!')
      setModal(false); fetchAll()
    } catch (e) { setFormErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  // ✨ AI Summary function
  const generateSummary = async () => {
    if (!form.title || !form.author) { setFormErr('Enter title and author first'); return }
    setAiLoading(true)
    setFormErr('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, author: form.author })
      })
      const data = await res.json()
      setAiSummary(data.summary)
    } catch { setFormErr('AI summary failed') }
    finally { setAiLoading(false) }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    try { await bookAPI.delete(id); showToast('Book deleted'); fetchAll() }
    catch { showToast('Delete failed', 'error') }
  }

  const filtered = books.filter(b =>
    !search ||
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  )

  const navItems = [
    {id:'overview', icon:'◈', label:'Overview'},
    {id:'books', icon:'📖', label:'Books'},
    {id:'members', icon:'👥', label:'Members'},
    {id:'transactions', icon:'↕️', label:'Transactions'},
    {id:'reports', icon:'📊', label:'Reports'},
  ]

  const statCards = [
    {label:'Total Books', value:stats.totalBooks??0, icon:'📚', color:'#b8955a'},
    {label:'Available', value:stats.availableBooks??0, icon:'✅', color:'#52c97a'},
    {label:'Checked Out', value:stats.checkedOutBooks??0, icon:'📤', color:'#6b8fff'},
    {label:'Categories', value:stats.totalCategories??0, icon:'🏷', color:'#ff9b6b'},
  ]

  const s = styles
  return (
    <div style={s.layout}>
      {/* SIDEBAR */}
      <nav style={s.sidebar}>
        <div style={s.sTop}>
          <div style={{fontSize:'34px', marginBottom:'8px'}}>📚</div>
          <div style={s.logoText}>LibraryMS</div>
          <div style={s.logoSub}>Management System</div>
        </div>
        <div style={s.navSection}>
          <div style={s.navLabel}>MAIN MENU</div>
          {navItems.map(item => (
            <button key={item.id}
              style={{...s.navBtn, ...(tab===item.id ? s.navActive : {})}}
              onClick={() => setTab(item.id)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={s.sBottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>{(user.fullName||'U')[0].toUpperCase()}</div>
            <div>
              <div style={{fontSize:'13px', fontWeight:'500', color:'#fffffe'}}>{user.fullName||'Librarian'}</div>
              <div style={{fontSize:'11px', color:'rgba(255,255,255,0.35)'}}>{user.role||'USER'}</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>⏏ Sign Out</button>
        </div>
      </nav>

      {/* MAIN */}
      <main style={s.main}>
        {toast && (
          <div style={{...s.toast, background: toast.type==='error' ? 'rgba(200,50,50,0.95)' : 'rgba(40,160,80,0.95)'}}>
            {toast.type==='error'?'⚠':'✓'} {toast.msg}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={s.header}>
              <div>
                <h1 style={s.pageTitle}>Good day, {user.fullName?.split(' ')[0]||'Librarian'} 👋</h1>
                <p style={s.pageSub}>Here is what is happening in your library today.</p>
              </div>
              <button style={s.primaryBtn} onClick={() => setTab('books')}>Manage Books →</button>
            </div>
            <div style={s.statsGrid}>
              {statCards.map(sc => (
                <div key={sc.label} style={{...s.statCard, borderTopColor:sc.color}}>
                  <div style={{fontSize:'30px', marginBottom:'10px'}}>{sc.icon}</div>
                  <div style={{...s.statVal, color:sc.color}}>{sc.value}</div>
                  <div style={s.statLbl}>{sc.label}</div>
                </div>
              ))}
            </div>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Recent Books</h2>
              <button style={s.linkBtn} onClick={() => setTab('books')}>View all →</button>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr>{['Title','Author','Category','Copies','Status'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {books.slice(0,5).map(b=>(
                    <tr key={b.id} style={s.tr}>
                      <td style={{...s.td, fontWeight:'500', color:'#fffffe'}}>{b.title}</td>
                      <td style={s.td}>{b.author}</td>
                      <td style={s.td}><span style={s.catBadge}>{b.category}</span></td>
                      <td style={s.td}>{b.availableCopies}/{b.totalCopies}</td>
                      <td style={s.td}><span style={{...s.badge, ...(b.status==='AVAILABLE'?s.avail:s.out)}}>{b.status}</span></td>
                    </tr>
                  ))}
                  {books.length===0 && <tr><td colSpan={5} style={{...s.td, textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.3)'}}>No books yet — add your first book!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKS */}
        {tab === 'books' && (
          <div>
            <div style={s.header}>
              <div>
                <h1 style={s.pageTitle}>Books Collection</h1>
                <p style={s.pageSub}>{books.length} books in catalog</p>
              </div>
              <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                <input style={s.searchInput} placeholder="🔍 Search title, author, category..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                <button style={s.primaryBtn} onClick={openAdd}>+ Add Book</button>
              </div>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr>{['#','Title','Author','ISBN','Category','Year','Copies','Status','Actions'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map((b,i)=>(
                    <tr key={b.id} style={s.tr}>
                      <td style={{...s.td, color:'rgba(255,255,255,0.3)'}}>{i+1}</td>
                      <td style={{...s.td, fontWeight:'500', color:'#fffffe'}}>{b.title}</td>
                      <td style={s.td}>{b.author}</td>
                      <td style={{...s.td, fontFamily:'monospace', fontSize:'11px', color:'rgba(255,255,255,0.4)'}}>{b.isbn||'—'}</td>
                      <td style={s.td}><span style={s.catBadge}>{b.category||'—'}</span></td>
                      <td style={s.td}>{b.publishYear||'—'}</td>
                      <td style={s.td}>{b.availableCopies}/{b.totalCopies}</td>
                      <td style={s.td}><span style={{...s.badge, ...(b.status==='AVAILABLE'?s.avail:s.out)}}>{b.status}</span></td>
                      <td style={s.td}>
                        <button style={s.editBtn} onClick={()=>openEdit(b)}>Edit</button>
                        <button style={s.delBtn} onClick={()=>handleDelete(b.id, b.title)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && (
                    <tr><td colSpan={9} style={{...s.td, textAlign:'center', padding:'60px', color:'rgba(255,255,255,0.3)'}}>
                      {books.length===0 ? '📚 No books yet — add your first!' : `No results for "${search}"`}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLACEHOLDER TABS */}
        {['members','transactions','reports'].includes(tab) && (
          <div style={s.comingSoon}>
            <div style={{fontSize:'70px', marginBottom:'20px'}}>{tab==='members'?'👥':tab==='transactions'?'↕️':'📊'}</div>
            <h2 style={s.pageTitle}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</h2>
            <p style={{color:'rgba(255,255,255,0.4)', marginTop:'10px'}}>Coming in the next release!</p>
          </div>
        )}
      </main>

      {/* MODAL */}
      {modal && (
        <div style={s.overlay} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={s.modal}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
              <h3 style={s.modalTitle}>{editTarget ? 'Edit Book' : 'Add New Book'}</h3>
              <button style={{background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'18px', cursor:'pointer'}} onClick={()=>setModal(false)}>✕</button>
            </div>

            {formErr && <div style={s.formErr}>⚠ {formErr}</div>}

            {/* ✨ AI SUMMARY BUTTON */}
            <button
              style={{...s.aiBtn, opacity: aiLoading ? 0.7 : 1}}
              onClick={generateSummary}
              disabled={aiLoading}
            >
              {aiLoading ? '✨ Generating Summary...' : '✨ Generate AI Summary'}
            </button>

            {/* ✨ AI SUMMARY RESULT */}
            {aiSummary && (
              <div style={s.aiBox}>
                <div style={s.aiBoxLabel}>✨ AI SUMMARY</div>
                {aiSummary}
              </div>
            )}

            <div style={s.formGrid}>
              {[
                {key:'title', label:'Book Title *', span:true, type:'text', ph:'e.g. The Great Gatsby'},
                {key:'author', label:'Author *', type:'text', ph:'e.g. F. Scott Fitzgerald'},
                {key:'isbn', label:'ISBN', type:'text', ph:'978-...'},
                {key:'category', label:'Category', type:'text', ph:'Fiction, Technology...'},
                {key:'publisher', label:'Publisher', type:'text', ph:'Publisher name'},
                {key:'publishYear', label:'Year', type:'number', ph:'2024'},
                {key:'totalCopies', label:'Total Copies', type:'number'},
                {key:'availableCopies', label:'Available', type:'number'},
              ].map(f=>(
                <div key={f.key} style={{...s.fField, gridColumn:f.span?'1/-1':'auto'}}>
                  <label style={s.fLabel}>{f.label}</label>
                  <input style={s.fInput} type={f.type||'text'} placeholder={f.ph||''}
                    value={form[f.key]||''}
                    onChange={e=>setForm(p=>({...p, [f.key]: f.type==='number'?(parseInt(e.target.value)||0):e.target.value}))} />
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'24px'}}>
              <button style={s.cancelBtn} onClick={()=>setModal(false)}>Cancel</button>
              <button style={{...s.primaryBtn, opacity:saving?0.7:1}} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  layout: { display:'flex', minHeight:'100vh', background:'#0a0a0f', color:'#fffffe', fontFamily:"'Jost',sans-serif" },
  sidebar: {
    width:'248px', background:'#0e0d18', borderRight:'1px solid rgba(184,149,90,0.1)',
    display:'flex', flexDirection:'column', position:'fixed', height:'100vh', zIndex:50,
  },
  sTop: { padding:'26px 20px 18px', borderBottom:'1px solid rgba(184,149,90,0.1)' },
  logoText: {
    fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', fontWeight:'700',
    background:'linear-gradient(135deg,#d4a853,#f0d090)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
  },
  logoSub: { fontSize:'10px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', marginTop:'3px' },
  navSection: { flex:1, padding:'18px 10px' },
  navLabel: { fontSize:'10px', fontWeight:'700', letterSpacing:'0.12em', color:'rgba(255,255,255,0.25)', paddingLeft:'10px', marginBottom:'8px' },
  navBtn: {
    display:'flex', alignItems:'center', gap:'10px', width:'100%',
    padding:'10px 12px', borderRadius:'8px', border:'none',
    background:'transparent', color:'rgba(255,255,255,0.5)',
    fontSize:'14px', cursor:'pointer', fontFamily:"'Jost',sans-serif",
    marginBottom:'2px', textAlign:'left',
  },
  navActive: { background:'rgba(184,149,90,0.15)', color:'#d4a853', border:'1px solid rgba(184,149,90,0.25)' },
  sBottom: { padding:'14px', borderTop:'1px solid rgba(184,149,90,0.1)' },
  userCard: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' },
  avatar: {
    width:'34px', height:'34px', borderRadius:'8px', flexShrink:0,
    background:'linear-gradient(135deg,#b8955a,#d4b070)',
    color:'#0a0a0f', fontWeight:'700', fontSize:'15px',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  logoutBtn: {
    width:'100%', padding:'9px', background:'rgba(220,60,60,0.08)',
    border:'1px solid rgba(220,60,60,0.2)', borderRadius:'8px',
    color:'#ff8080', cursor:'pointer', fontSize:'13px', fontFamily:"'Jost',sans-serif",
  },
  main: { marginLeft:'248px', flex:1, padding:'36px 40px' },
  toast: {
    position:'fixed', top:'20px', right:'20px', padding:'13px 22px',
    borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:'500', zIndex:200,
  },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px' },
  pageTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:'28px', fontWeight:'600', margin:'0 0 6px', color:'#fffffe' },
  pageSub: { color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:0 },
  primaryBtn: {
    padding:'11px 22px', background:'linear-gradient(135deg,#b8955a,#d4b070)',
    border:'none', borderRadius:'10px', color:'#0a0a0f',
    fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:"'Jost',sans-serif", whiteSpace:'nowrap',
  },
  // ✨ AI Button style
  aiBtn: {
    width:'100%', padding:'11px', marginBottom:'14px',
    background:'linear-gradient(135deg,rgba(107,143,255,0.15),rgba(184,149,90,0.15))',
    border:'1px solid rgba(107,143,255,0.35)', borderRadius:'10px',
    color:'#a0b4ff', fontSize:'14px', fontWeight:'600',
    cursor:'pointer', fontFamily:"'Jost',sans-serif",
  },
  // ✨ AI Summary box style
  aiBox: {
    background:'rgba(184,149,90,0.08)', border:'1px solid rgba(184,149,90,0.25)',
    borderRadius:'10px', padding:'14px', marginBottom:'16px',
    fontSize:'13px', color:'rgba(255,255,255,0.75)', lineHeight:'1.7',
  },
  aiBoxLabel: {
    fontSize:'10px', color:'#b8955a', fontWeight:'700',
    letterSpacing:'0.1em', marginBottom:'8px',
  },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' },
  statCard: {
    borderRadius:'14px', padding:'22px',
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
    borderTop:'3px solid',
  },
  statVal: { fontSize:'34px', fontWeight:'700', lineHeight:1 },
  statLbl: { color:'rgba(255,255,255,0.45)', fontSize:'12px', marginTop:'6px', textTransform:'uppercase', letterSpacing:'0.06em' },
  sectionHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' },
  sectionTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', fontWeight:'600', margin:0 },
  linkBtn: { background:'none', border:'none', color:'#b8955a', cursor:'pointer', fontSize:'14px', fontFamily:"'Jost',sans-serif" },
  tableWrap: { background:'rgba(255,255,255,0.025)', border:'1px solid rgba(184,149,90,0.1)', borderRadius:'14px', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: {
    padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:'600',
    letterSpacing:'0.09em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)',
    background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.06)',
  },
  tr: { borderBottom:'1px solid rgba(255,255,255,0.04)' },
  td: { padding:'12px 16px', fontSize:'14px', color:'rgba(255,255,255,0.7)' },
  catBadge: {
    display:'inline-block', padding:'2px 10px', borderRadius:'20px',
    background:'rgba(184,149,90,0.12)', color:'#b8955a',
    border:'1px solid rgba(184,149,90,0.25)', fontSize:'12px',
  },
  badge: { display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' },
  avail: { background:'rgba(82,201,122,0.12)', color:'#52c97a', border:'1px solid rgba(82,201,122,0.25)' },
  out:   { background:'rgba(255,107,107,0.12)', color:'#ff8080', border:'1px solid rgba(255,107,107,0.25)' },
  editBtn: {
    padding:'5px 12px', marginRight:'6px', borderRadius:'6px',
    background:'rgba(107,143,255,0.1)', border:'1px solid rgba(107,143,255,0.3)',
    color:'#6b8fff', cursor:'pointer', fontSize:'12px', fontFamily:"'Jost',sans-serif",
  },
  delBtn: {
    padding:'5px 12px', borderRadius:'6px',
    background:'rgba(220,60,60,0.1)', border:'1px solid rgba(220,60,60,0.3)',
    color:'#ff8080', cursor:'pointer', fontSize:'12px', fontFamily:"'Jost',sans-serif",
  },
  searchInput: {
    padding:'10px 16px', background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(184,149,90,0.2)', borderRadius:'10px',
    color:'#fffffe', fontSize:'14px', outline:'none',
    fontFamily:"'Jost',sans-serif", width:'280px',
  },
  comingSoon: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh' },
  overlay: {
    position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
    backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
  },
  modal: {
    background:'#13121e', border:'1px solid rgba(184,149,90,0.2)',
    borderRadius:'20px', padding:'32px', width:'560px', maxHeight:'90vh', overflowY:'auto',
  },
  modalTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:'22px', fontWeight:'600', color:'#fffffe', margin:0 },
  formErr: {
    background:'rgba(220,60,60,0.1)', border:'1px solid rgba(220,60,60,0.3)',
    borderRadius:'10px', padding:'10px 14px', color:'#ff8080', fontSize:'13px', marginBottom:'16px',
  },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' },
  fField: {},
  fLabel: { display:'block', fontSize:'11px', fontWeight:'600', letterSpacing:'0.08em', color:'rgba(255,255,255,0.4)', marginBottom:'6px' },
  fInput: {
    width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)',
    border:'1px solid rgba(184,149,90,0.2)', borderRadius:'8px',
    color:'#fffffe', fontSize:'14px', outline:'none',
    fontFamily:"'Jost',sans-serif", boxSizing:'border-box',
  },
  cancelBtn: {
    padding:'10px 20px', background:'transparent', border:'1px solid rgba(255,255,255,0.15)',
    borderRadius:'10px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontFamily:"'Jost',sans-serif",
  },
}
