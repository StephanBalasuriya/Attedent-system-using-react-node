import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const POLL_INTERVAL_MS = 5000

const initialFormState = {
  name: '',
  employeeId: '',
  department: '',
}

const formatDateTime = (value) => {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString()
}

const statusClassName = (status) => {
  if (status === 'success') {
    return 'badge badge-success'
  }

  if (status === 'failed') {
    return 'badge badge-failed'
  }

  return 'badge badge-waiting'
}

function App() {
  const [userForm, setUserForm] = useState(initialFormState)
  const [users, setUsers] = useState([])
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  )
  const [attendance, setAttendance] = useState([])
  const [attendanceStatus, setAttendanceStatus] = useState({
    status: 'waiting',
    message: 'Camera monitoring is active and waiting for a face.',
  })
  const [cameraPreview, setCameraPreview] = useState(null)
  const [monitoring, setMonitoring] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [submittingUser, setSubmittingUser] = useState(false)
  const [formMessage, setFormMessage] = useState(null)

  const statusSummary = useMemo(() => {
    if (attendanceStatus.status === 'success') {
      return 'Attendance captured successfully'
    }

    if (attendanceStatus.status === 'failed') {
      return 'Face detected, but attendance failed'
    }

    return 'Camera is on and waiting for a face'
  }, [attendanceStatus.status])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load users.')
      }

      setUsers(data.users || [])
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error.message,
      })
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  const fetchAttendance = useCallback(async (date) => {
    setLoadingAttendance(true)

    try {
      const response = await fetch(`${API_BASE_URL}/attendance?date=${date}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load attendance.')
      }

      setAttendance(data.attendance || [])
    } catch (error) {
      setAttendanceStatus({
        status: 'failed',
        message: error.message,
      })
    } finally {
      setLoadingAttendance(false)
    }
  }, [])

  const scanAttendance = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to scan attendance.')
      }

      setAttendanceStatus({
        status: data.status || 'waiting',
        message: data.message || 'Camera is active.',
      })
      setCameraPreview(data.previewImage || null)

      if (data.status === 'success' || data.status === 'failed') {
        await fetchAttendance(attendanceDate)
      }
    } catch (error) {
      setAttendanceStatus({
        status: 'failed',
        message: error.message,
      })
      setCameraPreview(null)
    }
  }, [attendanceDate, fetchAttendance])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchAttendance(attendanceDate)
  }, [attendanceDate, fetchAttendance])

  useEffect(() => {
    if (!monitoring) {
      return undefined
    }

    scanAttendance()
    const intervalId = window.setInterval(scanAttendance, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [monitoring, scanAttendance])

  const handleUserChange = (event) => {
    const { name, value } = event.target
    setUserForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleAddUser = async (event) => {
    event.preventDefault()
    setSubmittingUser(true)
    setFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to add the user.')
      }

      setCameraPreview(data.previewImage || null)
      setUserForm(initialFormState)
      setFormMessage({
        type: 'success',
        text: data.message || 'User added successfully.',
      })
      await fetchUsers()
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error.message,
      })
    } finally {
      setSubmittingUser(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Face detection attendance system</p>
          <h1>Camera monitoring, user setup, and attendance tracking</h1>
          <p className="hero-copy">
            The Node backend handles user and attendance queries while the Python
            service keeps the camera active and returns a preview only after a
            face is detected.
          </p>
        </div>
        <div className="status-panel">
          <span className={statusClassName(attendanceStatus.status)}>
            {statusSummary}
          </span>
          <p>{attendanceStatus.message}</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setMonitoring((current) => !current)}
          >
            {monitoring ? 'Pause camera monitoring' : 'Resume camera monitoring'}
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel camera-panel">
          <div className="panel-heading">
            <h2>Camera screen</h2>
            <span className={statusClassName(attendanceStatus.status)}>
              {attendanceStatus.status}
            </span>
          </div>
          {cameraPreview ? (
            <img
              className="camera-preview"
              src={cameraPreview}
              alt="Detected face preview"
            />
          ) : (
            <div className="camera-placeholder">
              <p>Camera is on and scanning in the backend.</p>
              <p>The preview stays hidden until a face is detected.</p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Add user</h2>
            <p>Capture a face and store the person in the database.</p>
          </div>
          <form className="stacked-form" onSubmit={handleAddUser}>
            <label>
              <span>Name</span>
              <input
                name="name"
                value={userForm.name}
                onChange={handleUserChange}
                placeholder="Enter full name"
                required
              />
            </label>
            <label>
              <span>Employee ID</span>
              <input
                name="employeeId"
                value={userForm.employeeId}
                onChange={handleUserChange}
                placeholder="EMP-1001"
                required
              />
            </label>
            <label>
              <span>Department</span>
              <input
                name="department"
                value={userForm.department}
                onChange={handleUserChange}
                placeholder="Operations"
                required
              />
            </label>
            <button type="submit" disabled={submittingUser}>
              {submittingUser ? 'Adding user...' : 'Add user from detected face'}
            </button>
          </form>
          {formMessage ? (
            <p
              className={
                formMessage.type === 'success' ? 'message success' : 'message error'
              }
            >
              {formMessage.text}
            </p>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Users in database</h2>
            <p>{loadingUsers ? 'Loading users...' : `${users.length} user(s)`}</p>
          </div>
          <div className="list">
            {users.length === 0 ? (
              <p className="empty-state">No users found yet.</p>
            ) : (
              users.map((user) => (
                <article className="list-card" key={user.id}>
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.department}</p>
                  </div>
                  <div className="list-meta">
                    <span>{user.employeeId}</span>
                    <span>{formatDateTime(user.createdAt)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel attendance-panel">
          <div className="panel-heading attendance-heading">
            <div>
              <h2>Attendance by date</h2>
              <p>Review whether each attendance attempt succeeded or failed.</p>
            </div>
            <label className="date-filter">
              <span>Date</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
              />
            </label>
          </div>
          {loadingAttendance ? (
            <p className="empty-state">Loading attendance...</p>
          ) : attendance.length === 0 ? (
            <p className="empty-state">No attendance records for this date.</p>
          ) : (
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>User</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Message</th>
                    <th>Captured at</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <span className={statusClassName(entry.status)}>
                          {entry.status}
                        </span>
                      </td>
                      <td>{entry.user?.name || 'Unknown face'}</td>
                      <td>{entry.user?.employeeId || '—'}</td>
                      <td>{entry.user?.department || '—'}</td>
                      <td>{entry.message}</td>
                      <td>{formatDateTime(entry.capturedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
