import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import Icon from "../components/Icons"

function getRole(username, token) {
  const roles = {
    admin: "ADMIN",
    manager: "BRANCH_MANAGER",
    vikas: "COLLECTION_AGENT"
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    if (payload.role) return String(payload.role).toUpperCase()
    if (payload.user_role) return String(payload.user_role).toUpperCase()
  } catch {}

  return roles[username.toLowerCase()] || "UNKNOWN"
}

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("Admin@12345")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [shake, setShake] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/auth/token/", { username, password })
      const role = getRole(username, response.data.access)
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)
      localStorage.setItem("username", username)
      localStorage.setItem("role", role)
      navigate("/")
    } catch {
      setError("Invalid username or password")
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className={`login-card${shake ? " shake" : ""}`}>
        <div className="brand login-brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CMRS</strong>
            <span>Cash Management</span>
          </div>
        </div>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage collections and reconciliation.</p>
        <form onSubmit={submit}>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
          <label>Password</label>
          <div className="field">
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="reveal" onClick={() => setShow(v => !v)} aria-label={show ? "Hide password" : "Show password"}>
              <Icon name={show ? "eyeOff" : "eye"} />
            </button>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary full" disabled={loading}>
            {loading ? <><span className="spinner" />Signing in…</> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}