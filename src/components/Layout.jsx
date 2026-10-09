import { useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import Icon from "./Icons"

const linksByRole = {
  ADMIN: [
    ["Dashboard", "/"],
    ["Customers", "/customers"],
    ["Loans", "/loans"],
    ["Collections", "/collections"],
    ["Reconciliation", "/reconciliation"],
    ["Bank Deposits", "/deposits"]
  ],
  BRANCH_MANAGER: [
    ["Dashboard", "/"],
    ["Customers", "/customers"],
    ["Loans", "/loans"],
    ["Collections", "/collections"],
    ["Reconciliation", "/reconciliation"],
    ["Bank Deposits", "/deposits"]
  ],
  COLLECTION_AGENT: [
    ["Dashboard", "/"],
    ["Collections", "/collections"]
  ],
  BRANCH_OPERATOR: [
    ["Dashboard", "/"],
    ["Customers", "/customers"],
    ["Loans", "/loans"],
    ["Collections", "/collections"],
    ["Reconciliation", "/reconciliation"],
    ["Bank Deposits", "/deposits"]
  ]
}

const iconFor = {
  "/": "dashboard", "/customers": "customers", "/loans": "loans",
  "/collections": "collections", "/reconciliation": "reconciliation", "/deposits": "deposits"
}

export default function Layout() {
  const location = useLocation()
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light")

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", next)
    try { localStorage.setItem("theme", next) } catch {}
    setTheme(next)
  }

  const navigate = useNavigate()
  const role = localStorage.getItem("role") || "UNKNOWN"
  const links = linksByRole[role] || [["Dashboard", "/"]]

  function logout() {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CMRS</strong>
            <span>Cash Management</span>
          </div>
        </div>
        <nav>
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === "/"}>
              <Icon name={iconFor[path]} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="logout" onClick={logout}><Icon name="logout" />Logout</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Operations</span>
            <h1>Cash Management & Reconciliation</h1>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle theme">
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <div className="user-box">
              <div>
                <span>{role.replaceAll("_", " ")}</span>
                <strong>{localStorage.getItem("username") || "User"}</strong>
              </div>
              <div className="avatar">{(localStorage.getItem("username") || "U").slice(0, 1)}</div>
            </div>
          </div>
        </header>
        <section className="content">
          <div className="page" key={location.pathname}>
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  )
}