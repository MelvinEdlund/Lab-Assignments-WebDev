import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { auctionsApi } from "../../api/auctionsApi";
import type { Auction } from "../../types";
import AuctionCard from "../../components/auction/AuctionCard/AuctionCard";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./MyAuctionsPage.css";

type MyFilter = "active" | "closed" | "inactive";

export default function MyAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filter, setFilter] = useState<MyFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMine();
  }, []);

  const fetchMine = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auctionsApi.getMine();
      setAuctions(data);
    } catch {
      setError("Kunde inte hämta dina auktioner.");
    } finally {
      setLoading(false);
    }
  };

  const { active, closed, inactive } = useMemo(() => {
    const active = auctions.filter((a) => a.isActive && a.isOpen);
    const closed = auctions.filter((a) => a.isActive && !a.isOpen);
    const inactive = auctions.filter((a) => !a.isActive);
    return { active, closed, inactive };
  }, [auctions]);

  const visible =
    filter === "active" ? active : filter === "closed" ? closed : inactive;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="my-auctions-header">
        <div>
          <h1 className="my-auctions-title">📋 Mina auktioner</h1>
          <p className="my-auctions-subtitle">
            Här ser du alla auktioner du har skapat.
          </p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + Ny auktion
        </Link>
      </div>

      <div className="my-auctions-filter">
        <button
          className={`btn ${filter === "active" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("active")}
        >
          Aktiva ({active.length})
        </button>
        <button
          className={`btn ${filter === "closed" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("closed")}
        >
          Avslutade ({closed.length})
        </button>
        <button
          className={`btn ${
            filter === "inactive" ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => setFilter("inactive")}
        >
          Inaktiverade ({inactive.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="my-auctions-empty">
          {filter === "active" && "Du har inga aktiva auktioner just nu."}
          {filter === "closed" && "Du har inga avslutade auktioner än."}
          {filter === "inactive" &&
            "Inga av dina auktioner har inaktiverats av admin."}
        </p>
      ) : (
        <div className="my-auctions-grid">
          {visible.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}
    </div>
  );
}
