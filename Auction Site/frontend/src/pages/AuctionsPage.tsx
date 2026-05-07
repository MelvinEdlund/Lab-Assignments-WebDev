import { useEffect, useState } from "react";
import { auctionsApi } from "../api/auctionsApi";
import type { Auction } from "../types";
import AuctionCard from "../components/auction/AuctionCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

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

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Sök på titel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "0.5rem" }}
        />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setFilter("open")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "open" ? "#333" : "#eee",
              color: filter === "open" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Öppna
          </button>
          <button
            onClick={() => setFilter("closed")}
            style={{
              padding: "0.5rem 1rem",
              background: filter === "closed" ? "#333" : "#eee",
              color: filter === "closed" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Avslutade
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && auctions.length === 0 && (
        <p>Inga auktioner hittades.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {auctions.map((a) => (
          <AuctionCard key={a.id} auction={a} />
        ))}
      </div>
    </div>
  );
}
