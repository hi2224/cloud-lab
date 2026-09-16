import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const emptyForm = { studentId: '', name: '', email: '' }
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadStudents = async () => {
    try {
      setError('')
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Không thể tải danh sách sinh viên')
      setStudents(await response.json())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStudents() }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const response = await fetch(editingId ? `/api/students/${editingId}` : '/api/students', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message)
      setStudents(editingId ? students.map((student) => student._id === editingId ? result : student) : [...students, result])
      setForm(emptyForm)
      setEditingId(null)
      setMessage(editingId ? 'Đã cập nhật sinh viên' : 'Đã thêm sinh viên mới')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleEdit = (student) => {
    setEditingId(student._id)
    setForm({ studentId: student.studentId, name: student.name, email: student.email })
    setMessage('')
    setError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || result.message)
      }
      setStudents(students.filter((student) => student._id !== id))
      setMessage('Đã xóa sinh viên')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const filteredStudents = students.filter((student) =>
    `${student.studentId} ${student.name} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  return (
    <main className="app-shell">
      <nav className="topbar"><div className="brand"><span className="brand-icon">✦</span><span>STUDENT<span>HUB</span></span></div><div className="profile"><span className="profile-avatar">Q</span><span>Quản trị viên</span><span className="profile-dot" /></div></nav>
      <header className="page-header"><div><p className="eyebrow">QUẢN LÝ ĐÀO TẠO / TỔNG QUAN</p><h1>Danh sách sinh viên</h1><p className="subtitle">Một không gian gọn gàng để quản lý thông tin lớp học.</p></div><div className="header-date"><span className="live-dot" /> Dữ liệu đang cập nhật</div></header>
      <section className="stats-grid"><div className="stat-card stat-primary"><span className="stat-label">TỔNG SINH VIÊN</span><strong>{students.length}</strong><span className="stat-note">Hồ sơ trong hệ thống</span></div><div className="stat-card"><span className="stat-label">TRẠNG THÁI</span><strong className="status-value">Đang hoạt động</strong><span className="stat-note"><span className="live-dot" /> Kết nối ổn định</span></div><div className="stat-card"><span className="stat-label">CẬP NHẬT</span><strong className="status-value">Hôm nay</strong><span className="stat-note">Danh sách mới nhất</span></div></section>
      <section className="content-grid">
        <form className="student-form" onSubmit={handleSubmit}>
          <div className="section-heading"><span className="heading-mark">+</span><div><h2>{editingId ? 'Cập nhật thông tin' : 'Thêm sinh viên'}</h2><p>Điền đầy đủ thông tin bên dưới</p></div></div>
          <label htmlFor="studentId">Mã sinh viên</label><input id="studentId" name="studentId" value={form.studentId} onChange={handleChange} placeholder="VD: SV001" required />
          <label htmlFor="name">Họ và tên</label><input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
          <label htmlFor="email">Email</label><input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="sinhvien@example.com" required />
          <div className="form-actions"><button className="primary-button" type="submit">{editingId ? 'Lưu thay đổi' : 'Thêm sinh viên'}</button>{editingId && <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Hủy</button>}</div>
        </form>
        <section className="list-panel">
          <div className="list-heading"><div><p className="eyebrow">DỮ LIỆU HIỆN TẠI</p><h2>Tất cả sinh viên</h2><p className="list-caption">Danh sách gồm {students.length} hồ sơ</p></div><button className="refresh-button" type="button" onClick={loadStudents} aria-label="Tải lại danh sách">↻</button></div>
          <div className="search-box"><span>⌕</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo mã, tên hoặc email..." aria-label="Tìm kiếm sinh viên" /></div>
          {message && <p className="status success">{message}</p>}{error && <p className="status error">{error}</p>}
          {loading ? <p className="empty-state">Đang tải danh sách...</p> : students.length === 0 ? <p className="empty-state">Chưa có sinh viên nào. Hãy thêm sinh viên đầu tiên.</p> : filteredStudents.length === 0 ? <p className="empty-state">Không tìm thấy sinh viên phù hợp.</p> : <div className="table-wrap"><table><thead><tr><th>Mã SV</th><th>Họ và tên</th><th>Email</th><th>Thao tác</th></tr></thead><tbody>{filteredStudents.map((student) => <tr key={student._id}><td><span className="student-id">{student.studentId}</span></td><td className="student-name"><span className="name-cell"><span className="student-avatar">{student.name.charAt(0).toUpperCase()}</span>{student.name}</span></td><td>{student.email}</td><td><div className="row-actions"><button type="button" onClick={() => handleEdit(student)}>Sửa</button><button type="button" className="delete-button" onClick={() => handleDelete(student._id)}>Xóa</button></div></td></tr>)}</tbody></table></div>}
        </section>
      </section>
    </main>
  )
}

export default App
