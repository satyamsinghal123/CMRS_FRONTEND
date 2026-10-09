import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import Loans from "./pages/Loans"
import Collections from "./pages/Collections"
import Reconciliation from "./pages/Reconciliation"
import Deposits from "./pages/Deposits"

const permissions = {
  ADMIN: ["/", "/customers", "/loans", "/collections", "/reconciliation", "/deposits"],
  BRANCH_MANAGER: ["/", "/customers", "/loans", "/collections", "/reconciliation", "/deposits"],
  COLLECTION_AGENT: ["/", "/collections"],
  BRANCH_OPERATOR: ["/", "/customers", "/loans", "/collections", "/reconciliation", "/deposits"]
}

function Protected({ path, children }) {
  const role = localStorage.getItem("role") || "UNKNOWN"
  if (!localStorage.getItem("access_token")) return <Navigate to="/login" replace />
  if (!permissions[role]?.includes(path)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        localStorage.getItem("access_token") ? <Layout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<Protected path="/"><Dashboard /></Protected>} />
        <Route path="customers" element={<Protected path="/customers"><Customers /></Protected>} />
        <Route path="loans" element={<Protected path="/loans"><Loans /></Protected>} />
        <Route path="collections" element={<Protected path="/collections"><Collections /></Protected>} />
        <Route path="reconciliation" element={<Protected path="/reconciliation"><Reconciliation /></Protected>} />
        <Route path="deposits" element={<Protected path="/deposits"><Deposits /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}