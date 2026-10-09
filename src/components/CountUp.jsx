import { useEffect, useState } from "react"

// Animates a number from 0 to `value`, formatted by `format`.
export default function CountUp({ value, format = (n) => n, duration = 900 }) {
  const target = Number(value || 0)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(target); return }
    let raf, start
    const tick = (t) => {
      start ??= t
      const p = Math.min((t - start) / duration, 1)
      setN(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return <>{format(n)}</>
}
