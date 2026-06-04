import { useEffect, useState } from "react";
import { auctionsApi } from "../../api/auctionsApi";
import { usersApi } from "../../api/usersApi";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import type { Auction, User } from "../../types";
import "./AdminPage.css";

type Tab = "auctions" | "users";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`admin-badge ${
        active ? "admin-badge-success" : "admin-badge-danger"
      }`}
    >
      {active ? "Aktiv" : "Inaktiv"}
    </span>
  );
}
function OpenBadge({ open }: { open: boolean }) {
  return (
    <span
      className={`admin-badge ${open ? "admin-badge-info" : "admin-badge-muted"}`}
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
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div className="admin-table-wrap">
      <p className="admin-summary">
        Totalt <strong>{auctions.length}</strong> auktioner •{" "}
        <strong>{auctions.filter((a) => a.isActive).length}</strong> aktiva
      </p>
      <table className="admin-table">
        <thead>
          <tr className="admin-table-head">
            <th className="admin-th">ID</th>
            <th className="admin-th">Titel</th>
            <th className="admin-th">Skapad av</th>
            <th className="admin-th">Startpris</th>
            <th className="admin-th">Slutdatum</th>
            <th className="admin-th">Öppen</th>
            <th className="admin-th">Aktiv</th>
            <th className="admin-th">Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map((a) => (
            <tr
              key={a.id}
              className={`admin-row ${a.isActive ? "" : "admin-row-muted"}`}
            >
              <td className="admin-td">{a.id}</td>
              <td className="admin-td admin-td-strong">{a.title}</td>
              <td className="admin-td">{a.username}</td>
              <td className="admin-td">{a.startingPrice} kr</td>
              <td className="admin-td admin-td-muted">
                {new Date(a.endDate).toLocaleString("sv-SE")}
              </td>
              <td className="admin-td">
                <OpenBadge open={a.isOpen} />
              </td>
              <td className="admin-td">
                <StatusBadge active={a.isActive} />
              </td>
              <td className="admin-td">
                <button
                  onClick={() => handleToggle(a)}
                  disabled={actionId === a.id}
                  className={`admin-action ${
                    a.isActive ? "admin-action-danger" : "admin-action-success"
                  }`}
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
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div className="admin-table-wrap">
      <p className="admin-summary">
        Totalt <strong>{users.length}</strong> användare •{" "}
        <strong>{users.filter((u) => u.isActive).length}</strong> aktiva
      </p>
      <table className="admin-table">
        <thead>
          <tr className="admin-table-head">
            <th className="admin-th">ID</th>
            <th className="admin-th">Användarnamn</th>
            <th className="admin-th">Email</th>
            <th className="admin-th">Roll</th>
            <th className="admin-th">Status</th>
            <th className="admin-th">Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className={`admin-row ${u.isActive ? "" : "admin-row-muted"}`}
            >
              <td className="admin-td">{u.id}</td>
              <td className="admin-td admin-td-strong">
                {u.username}
                {u.isAdmin && <span className="admin-role">ADMIN</span>}
              </td>
              <td className="admin-td admin-td-muted">{u.email}</td>
              <td className="admin-td">
                {u.isAdmin ? "Administratör" : "Användare"}
              </td>
              <td className="admin-td">
                <StatusBadge active={u.isActive} />
              </td>
              <td className="admin-td">
                <button
                  onClick={() => handleToggle(u)}
                  disabled={actionId === u.id || u.isAdmin}
                  title={
                    u.isAdmin ? "Admin-konton kan inte inaktiveras" : undefined
                  }
                  className={`admin-action ${
                    u.isAdmin
                      ? "admin-action-disabled"
                      : u.isActive
                        ? "admin-action-danger"
                        : "admin-action-success"
                  }`}
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
      <div className="admin-header">
        <span className="admin-header-icon">🛡️</span>
        <div>
          <h1 className="admin-header-title">Admin-panel</h1>
          <p className="admin-header-subtitle">
            Hantera auktioner och användarkonton
          </p>
        </div>
      </div>

      {/* Flikar */}
      <div className="admin-tabs">
        {(["auctions", "users"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab ${activeTab === tab ? "admin-tab-active" : ""}`}
          >
            {tab === "auctions" ? "🏷️ Auktioner" : "👥 Användare"}
          </button>
        ))}
      </div>

      {/* Innehåll */}
      <div className="admin-panel">
        {activeTab === "auctions" ? <AuctionsTab /> : <UsersTab />}
      </div>
    </div>
  );
}
