import { useEffect, useState } from "react";
import { auctionsApi } from "../../api/auctionsApi";
import type { Auction } from "../../types";
import AuctionCard from "../../components/auction/AuctionCard/AuctionCard";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./AuctionsPage.css";

type AuctionFilter = "open" | "closed";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AuctionFilter>("open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuctions();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        filter === "open"
          ? await auctionsApi.getOpen(search || undefined)
          : await auctionsApi.getClosed(search || undefined);
      setAuctions(data);
    } catch {
      setError("Kunde inte hämta auktioner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Auktioner</h1>

      <div className="auctions-toolbar">
        <input
          type="text"
          className="form-control"
          placeholder="Sök på titel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="auctions-filter">
          <button
            className={`btn ${filter === "open" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("open")}
          >
            Öppna
          </button>
          <button
            className={`btn ${filter === "closed" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("closed")}
          >
            Avslutade
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && auctions.length === 0 && (
        <p className="auctions-empty">Inga auktioner hittades.</p>
      )}

      <div className="auctions-grid">
        {auctions.map((a) => (
          <AuctionCard key={a.id} auction={a} />
        ))}
      </div>
    </div>
  );
}
