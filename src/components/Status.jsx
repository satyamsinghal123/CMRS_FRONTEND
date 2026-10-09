export default function Status({ value }) {
  return <span className={`status ${String(value || "").toLowerCase()}`}>{String(value || "").replaceAll("_", " ")}</span>
}
