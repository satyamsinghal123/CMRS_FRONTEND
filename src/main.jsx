import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./styles.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
// Material-style ripple on primary buttons (no per-page wiring needed)
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest?.("button.primary")
  if (!btn || btn.disabled) return
  const r = btn.getBoundingClientRect()
  const size = Math.max(r.width, r.height)
  const dot = document.createElement("span")
  dot.className = "ripple"
  dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`
  btn.appendChild(dot)
  setTimeout(() => dot.remove(), 650)
})
