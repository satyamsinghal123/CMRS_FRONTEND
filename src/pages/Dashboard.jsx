
import { useEffect, useState } from "react";
import api from "../api";
import CountUp from "../components/CountUp";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary/")
      .then((response) => setData(response.data))
      .catch((error) => {
        const status = error.response?.status;
        setError(status === 401
          ? "Your session has expired. Please sign in again."
          : status === 403
            ? "Your account does not have permission to view this dashboard."
            : "Could not load dashboard data. Check that the Django API is running.");
      });
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!data)
    return (
      <>
        <div className="page-title">
          <div>
            <span className="eyebrow">Overview</span>
            <h2>Daily operations</h2>
          </div>
        </div>
        <div className="stats-grid" aria-busy="true" aria-label="Loading dashboard">
          {Array.from({ length: 8 }, (_, i) => <div className="skeleton" key={i} />)}
        </div>
      </>
    );

  const cards = [
    ["Expected", data.expected_collections],
    ["Collected", data.total_collected],
    ["Agent Cash Held", data.cash_held_by_agents],
    ["Branch Received", data.cash_received_at_branch],
    ["Bank Deposited", data.bank_deposits],
    ["Settled", data.settled_amount],
    ["Outstanding", data.outstanding_loan_amount],
    ["Discrepancies", data.reconciliation_discrepancies],
  ];

  const maxLife = Math.max(1, ...Object.values(data.lifecycle || {}).map((v) => Number(v || 0)));

  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">Overview</span>
          <h2>Daily operations</h2>
          <p className="muted">For {data.date || "today"}</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map(([label, value], i) => (
          <div
            className={`stat-card${label === "Discrepancies" && Number(value) > 0 ? " warn" : ""}`}
            style={{ "--i": i }}
            key={label}
          >
            <span>{label}</span>
            <strong>
              {label === "Discrepancies" ? (
                <CountUp value={value} format={(n) => Math.round(n)} />
              ) : (
                <CountUp value={value} format={money} />
              )}
            </strong>
          </div>
        ))}
      </div>

      <div className="grid-two">
        <div className="panel">
          <div className="panel-head">
            <span className="eyebrow">Lifecycle</span>
            <h3>Cash movement</h3>
          </div>

          <div className="lifecycle">
            {Object.entries(data.lifecycle || {}).map(([status, amount]) => (
              <div className="life-item" key={status}>
                <div className="life-dot" />
                <div className="life-body">
                  <div className="life-row">
                    <strong>{status.replaceAll("_", " ").toLowerCase()}</strong>
                    <span>{money(amount)}</span>
                  </div>
                  <div className="life-bar">
                    <i style={{ width: `${Math.max(3, (Number(amount || 0) / maxLife) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="eyebrow">Status</span>
            <h3>Current position</h3>
          </div>

          <div className="summary-list">
            <div>
              <span>Expected collections</span>
              <strong>{money(data.expected_collections)}</strong>
            </div>

            <div>
              <span>Actual collections</span>
              <strong>{money(data.total_collected)}</strong>
            </div>

            <div>
              <span>Unreconciled cash</span>
              <strong>
                {money(
                  Number(data.total_collected || 0) -
                    Number(data.cash_received_at_branch || 0)
                )}
              </strong>
            </div>

            <div>
              <span>Settlement gap</span>
              <strong>
                {money(
                  Number(data.bank_deposits || 0) -
                    Number(data.settled_amount || 0)
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
