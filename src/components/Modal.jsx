import { useEffect, useState } from "react"

export default function Modal({ title, children, onClose }) {
  const [closing, setClosing] = useState(false)

  function close() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 170)
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  })

  return (
    <div className={`modal-backdrop${closing ? " closing" : ""}`} onMouseDown={close}>
      <div className={`modal${closing ? " closing" : ""}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" onClick={close} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
