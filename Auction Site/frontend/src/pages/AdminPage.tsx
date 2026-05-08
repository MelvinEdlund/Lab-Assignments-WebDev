import { useEffect, useState } from "react";
import { auctionsApi } from "../api/auctionsApi";
import { usersApi } from "../api/usersApi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import type { Auction, User } from "../types";

type Tab = "auctions" | "users";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: active ? "#d4edda" : "#f8d7da",
        color: active ? "#155724" : "#721c24",
      }}
    >
      {active ? "Aktiv" : "Inaktiv"}
    </span>
  );
}
function OpenBadge({ open }: { open: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: open ? "#d1ecf1" : "#e2e3e5",
        color: open ? "#0c5460" : "#383d41",
      }}
    >
      {open ? "Öppen" : "Avslutad"}
    </span>
  );
}

function AuctionsTab() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auctionsApi.getAll();
      // Sortera: inaktiva sist
      data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
      setAuctions(data);
    } catch {
      setError("Kunde inte hämta auktioner.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (auction: Auction) => {
    setActionId(auction.id);
    try {
      if (auction.isActive) {
        await auctionsApi.deactivate(auction.id);
      } else {
        await auctionsApi.activate(auction.id);
      }
      // Uppdatera lokalt utan ny fetch
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === auction.id ? { ...a, isActive: !a.isActive } : a,
        ),
      );
    } catch {
      setError("Åtgärden misslyckades. Försök igen.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: "#c0392b" }}>{error}</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        Totalt <strong>{auctions.length}</strong> auktioner •{" "}
        <strong>{auctions.filter((a) => a.isActive).length}</strong> aktiva
      </p>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Titel</th>
            <th style={thStyle}>Skapad av</th>
            <th style={thStyle}>Startpris</th>
            <th style={thStyle}>Slutdatum</th>
            <th style={thStyle}>Öppen</th>
            <th style={thStyle}>Aktiv</th>
            <th style={thStyle}>Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map((a) => (
            <tr
              key={a.id}
              style={{
                borderBottom: "1px solid #eee",
                opacity: a.isActive ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              <td style={tdStyle}>{a.id}</td>
              <td style={{ ...tdStyle, fontWeight: 500 }}>{a.title}</td>
              <td style={tdStyle}>{a.username}</td>
              <td style={tdStyle}>{a.startingPrice} kr</td>
              <td style={{ ...tdStyle, color: "#666", fontSize: "0.85rem" }}>
                {new Date(a.endDate).toLocaleString("sv-SE")}
              </td>
              <td style={tdStyle}>
                <OpenBadge open={a.isOpen} /> {/* ← NY cell */}
              </td>
              <td style={tdStyle}>
                <StatusBadge active={a.isActive} /> {/* oförändrad */}
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleToggle(a)}
                  disabled={actionId === a.id}
                  style={{
                    ...actionBtnStyle,
                    background: a.isActive ? "#e74c3c" : "#27ae60",
                  }}
                >
                  {actionId === a.id
                    ? "..."
                    : a.isActive
                      ? "Inaktivera"
                      : "Aktivera"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      // Admin-konton överst, sedan aktiva, inaktiva sist
      data.sort(
        (a, b) =>
          Number(b.isAdmin) - Number(a.isAdmin) ||
          Number(b.isActive) - Number(a.isActive),
      );
      setUsers(data);
    } catch {
      setError("Kunde inte hämta användare.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (user: User) => {
    setActionId(user.id);
    try {
      if (user.isActive) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.activate(user.id);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch {
      setError("Åtgärden misslyckades. Försök igen.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: "#c0392b" }}>{error}</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        Totalt <strong>{users.length}</strong> användare •{" "}
        <strong>{users.filter((u) => u.isActive).length}</strong> aktiva
      </p>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Användarnamn</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Roll</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              style={{
                borderBottom: "1px solid #eee",
                opacity: u.isActive ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              <td style={tdStyle}>{u.id}</td>
              <td style={{ ...tdStyle, fontWeight: 500 }}>
                {u.username}
                {u.isAdmin && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.7rem",
                      background: "#6c3483",
                      color: "#fff",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </td>
              <td style={{ ...tdStyle, color: "#555" }}>{u.email}</td>
              <td style={tdStyle}>
                {u.isAdmin ? "Administratör" : "Användare"}
              </td>
              <td style={tdStyle}>
                <StatusBadge active={u.isActive} />
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleToggle(u)}
                  disabled={actionId === u.id || u.isAdmin}
                  title={
                    u.isAdmin ? "Admin-konton kan inte inaktiveras" : undefined
                  }
                  style={{
                    ...actionBtnStyle,
                    background: u.isAdmin
                      ? "#ccc"
                      : u.isActive
                        ? "#e74c3c"
                        : "#27ae60",
                    cursor: u.isAdmin ? "not-allowed" : "pointer",
                  }}
                >
                  {actionId === u.id
                    ? "..."
                    : u.isAdmin
                      ? "Skyddad"
                      : u.isActive
                        ? "Inaktivera"
                        : "Aktivera"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("auctions");

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "2px solid #eee",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>🛡️</span>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Admin-panel</h1>
          <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
            Hantera auktioner och användarkonton
          </p>
        </div>
      </div>

      {/* Flikar */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.5rem",
          borderBottom: "2px solid #eee",
        }}
      >
        {(["auctions", "users"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.6rem 1.4rem",
              border: "none",
              borderBottom:
                activeTab === tab
                  ? "2px solid #2c3e50"
                  : "2px solid transparent",
              background: "transparent",
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? "#2c3e50" : "#888",
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.15s",
              marginBottom: "-2px",
            }}
          >
            {tab === "auctions" ? "🏷️ Auktioner" : "👥 Användare"}
          </button>
        ))}
      </div>

      {/* Innehåll */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #eee",
          padding: "1.5rem",
        }}
      >
        {activeTab === "auctions" ? <AuctionsTab /> : <UsersTab />}
      </div>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.9rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  fontWeight: 600,
  color: "#444",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  verticalAlign: "middle",
};

const actionBtnStyle: React.CSSProperties = {
  padding: "0.3rem 0.75rem",
  border: "none",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.15s",
};
