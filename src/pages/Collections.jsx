import { useEffect, useMemo, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import Status from "../components/Status";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function dateLabel(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function Collections() {
  const role = localStorage.getItem("role") || "";
  const isAgent = role === "COLLECTION_AGENT";
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [taskResponse, paymentResponse] = await Promise.all([
        api.get("/collection-tasks/"),
        api.get("/repayments/"),
      ]);
      setTasks(taskResponse.data.results || taskResponse.data || []);
      setPayments(paymentResponse.data.results || paymentResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load collection tasks. Check your login and API connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => Number(task.remaining_amount) > 0),
    [tasks]
  );

  function openPayment(task) {
    setSelected(task);
    setAmount(String(task.remaining_amount));
    setNotes("");
    setSuccess("");
    setError("");
    setShow(true);
  }

  async function submitCash() {
    setError(""); setSuccess("");
    try {
      const response = await api.post("/submissions/submit-cash/");
      setSuccess(`Cash submission ${response.data.submission_number} sent to the branch for reconciliation.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not submit collected cash to the branch.");
    }
  }

  async function submitPayment(event) {
    event.preventDefault();
    if (!selected) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/repayments/", {
  customer: selected.customer_pk,
  loan: selected.loan_pk,
  schedule: selected.schedule_pk,
  amount: numericAmount.toFixed(2),
  notes,
});
      setShow(false);
      setSelected(null);
      setSuccess("Payment recorded. The installment and loan balance have been updated.");
      await load();
    } catch (err) {
      const body = err.response?.data;
      const detail = typeof body === "string"
        ? body
        : body?.detail || Object.entries(body || {}).map(([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          ).join(" ");
      setError(detail || "Payment could not be recorded. Please check the amount and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">{isAgent ? "My work" : "Operations"}</span>
          <h2>{isAgent ? "My collection schedule" : "Collection schedule"}</h2>
          <p className="muted">
            {isAgent
              ? "Customers assigned to you with installments still due."
              : "Track due installments and record payments against the correct loan."}
          </p>
        </div>
        {isAgent && <button className="primary" onClick={submitCash}>Submit collected cash</button>}
      </div>

      {success && <div className="success-box">{success}</div>}
      {error && !show && <div className="error-box">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span>Assigned installments</span><strong>{tasks.length}</strong></div>
        <div className="stat-card"><span>Payments to collect</span><strong>{pendingTasks.length}</strong></div>
        <div className="stat-card"><span>Due amount remaining</span><strong>{money(pendingTasks.reduce((sum, task) => sum + Number(task.remaining_amount || 0), 0))}</strong></div>
        <div className="stat-card"><span>Overdue installments</span><strong>{pendingTasks.filter((task) => task.is_overdue).length}</strong></div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head"><div><span className="eyebrow">Action list</span><h3>Due and overdue installments</h3></div></div>
        {loading ? <div className="loading">Loading collection schedule...</div> : (
          <table>
            <thead><tr>
              <th>Due date</th><th>Customer</th><th>Loan</th><th>Installment</th>
              <th>Expected</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.schedule_id}>
                  <td>{dateLabel(task.due_date)}</td>
                  <td><strong>{task.customer_name}</strong><div className="muted">{task.customer_code} · {task.customer_phone || "No phone"}</div></td>
                  <td>{task.loan_code}</td>
                  <td>#{task.installment_number}</td>
                  <td>{money(task.expected_amount)}</td>
                  <td>{money(task.paid_amount)}</td>
                  <td>{money(task.remaining_amount)}</td>
                  <td><Status value={task.status} /></td>
                  <td>{Number(task.remaining_amount) > 0
                    ? <button className="primary" onClick={() => openPayment(task)}>Record payment</button>
                    : <span className="muted">Completed</span>}</td>
                </tr>
              ))}
              {!tasks.length && <tr><td colSpan="9">{isAgent ? "No assigned installments are currently due." : "No installments are currently due."}</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel table-panel">
        <div className="panel-head"><div><span className="eyebrow">Receipts</span><h3>Recent recorded payments</h3></div></div>
        <table>
          <thead><tr><th>Receipt</th><th>Customer</th><th>Loan</th><th>Amount</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            {payments.slice(0, 20).map((payment) => (
              <tr key={payment.id}>
                <td>{payment.receipt_number}</td>
                <td>{payment.customer_name || payment.customer}</td>
                <td>{payment.loan_code || payment.loan}</td>
                <td>{money(payment.amount)}</td>
                <td>{dateLabel(payment.collection_date)}</td>
                <td><Status value={payment.payment_type} /></td>
                <td><Status value={payment.status} /></td>
              </tr>
            ))}
            {!payments.length && <tr><td colSpan="7">No payments recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {show && selected && (
        <Modal title="Record customer payment" onClose={() => !saving && setShow(false)}>
          <div className="panel" style={{ marginBottom: 16 }}>
            <strong>{selected.customer_name}</strong>
            <p className="muted">{selected.customer_code} · Loan {selected.loan_code} · Installment #{selected.installment_number}</p>
            <div className="summary-list">
              <div><span>Installment due</span><strong>{money(selected.expected_amount)}</strong></div>
              <div><span>Already paid</span><strong>{money(selected.paid_amount)}</strong></div>
              <div><span>Remaining amount</span><strong>{money(selected.remaining_amount)}</strong></div>
            </div>
          </div>
          <form className="form-grid" onSubmit={submitPayment}>
            <label>Amount received
              <input type="number" min="0.01" step="0.01" max="999999999999" value={amount} onChange={(event) => setAmount(event.target.value)} required autoFocus />
            </label>
            <p className="muted">Customer, loan, installment, expected amount, agent, branch and receipt are supplied or validated by the system.</p>
            <label>Notes (optional)
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Payment notes" />
            </label>
            {error && <div className="error-box">{error}</div>}
            <button className="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Confirm payment"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
