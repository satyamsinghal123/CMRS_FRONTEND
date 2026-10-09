import { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";

export default function Customers() {
  const [list, setList] = useState([]);
  const [agents, setAgents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "", branch: "", assigned_agent: "" });
  const role = localStorage.getItem("role");
  const canManage = ["ADMIN", "BRANCH_MANAGER", "BRANCH_OPERATOR"].includes(role);

  async function load() {
    const response = await api.get("/customers/");
    setList(response.data.results || response.data);
  }
  async function loadBranches() {
    try {
      const response = await api.get("/branches/");
      setBranches(response.data.results || response.data || []);
    } catch {
      setBranches([]);
    }
  }
  async function loadAgents() {
    if (!canManage) return;
    try { const response = await api.get("/agents/"); setAgents(response.data); } catch { setAgents([]); }
  }
  useEffect(() => { load().catch(() => setError("Could not load customers.")); loadBranches(); loadAgents(); }, []);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

  async function submit(event) {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      await api.post("/customers/", { ...form, branch: Number(form.branch), assigned_agent: form.assigned_agent ? Number(form.assigned_agent) : null });
      setShow(false); setForm({ full_name: "", phone: "", email: "", address: "", branch: "", assigned_agent: "" }); await load();
    } catch (err) { setError(err.response?.data?.detail || JSON.stringify(err.response?.data || "Could not save customer.")); }
    finally { setSaving(false); }
  }
  async function assign(customer, agentId) {
    setError("");
    try { await api.patch(`/customers/${customer.id}/`, { assigned_agent: agentId ? Number(agentId) : null }); await load(); }
    catch (err) { setError(err.response?.data?.detail || JSON.stringify(err.response?.data || "Could not assign customer.")); }
  }

  return <>
    <div className="page-title"><div><span className="eyebrow">Customers</span><h2>{role === "COLLECTION_AGENT" ? "My assigned customers" : "Customer management"}</h2></div>{canManage && <button className="primary" onClick={() => setShow(true)}>Add customer</button>}</div>
    {error && <div className="error-box">{error}</div>}
    <div className="panel table-panel"><table><thead><tr><th>Customer ID</th><th>Name</th><th>Phone</th><th>Branch</th><th>Assigned agent</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>
      {list.map(customer => <tr key={customer.id}><td>{customer.customer_id}</td><td>{customer.full_name}</td><td>{customer.phone || "-"}</td><td>{customer.branch_name || customer.branch || "-"}</td><td>{canManage ? <select aria-label={`Assign ${customer.full_name}`} value={customer.assigned_agent || ""} onChange={e => assign(customer, e.target.value)}><option value="">Unassigned</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name} ({agent.username})</option>)}</select> : customer.assigned_agent_name || "Not assigned"}</td><td>₹{Number(customer.outstanding_amount || 0).toLocaleString("en-IN")}</td><td><span className={`status ${customer.is_active ? "active" : "inactive"}`}>{customer.is_active ? "Active" : "Inactive"}</span></td></tr>)}
      {!list.length && <tr><td colSpan="7">No customers found.</td></tr>}
    </tbody></table></div>
    {show && <Modal title="Add customer" onClose={() => setShow(false)}><form className="form-grid" onSubmit={submit}><input name="full_name" placeholder="Full name" value={form.full_name} onChange={change} required/><input name="phone" placeholder="Phone" value={form.phone} onChange={change} required/><input name="email" type="email" placeholder="Email" value={form.email} onChange={change}/><select name="branch" value={form.branch} onChange={change} required><option value="">Select branch</option>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>)}</select><select name="assigned_agent" value={form.assigned_agent} onChange={change}><option value="">Assign later</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select><textarea name="address" placeholder="Address" value={form.address} onChange={change}/><button className="primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save customer"}</button></form></Modal>}
  </>;
}
