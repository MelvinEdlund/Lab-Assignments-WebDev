import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auctionsApi } from "../api/auctionsApi";
import { bidsApi } from "../api/bidsApi";
import { useAuth } from "../context/AuthContext";
import BidForm from "../components/auction/BidForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import type { Auction, Bid } from "../types";

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [auctionId]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const auctionData = await auctionsApi.getById(auctionId);
      setAuction(auctionData);

      if (auctionData.isOpen) {
        const bidsData = await bidsApi.getByAuction(auctionId);
        setBids(bidsData);
      } else {
        setBids([]);
      }
    } catch {
      setError("Kunde inte hämta auktionen.");
    } finally {
      setLoading(false);
    }
  };

  const handleBidPlaced = (bid: Bid) => {
    setBids((prev) => [bid, ...prev].sort((a, b) => b.amount - a.amount));
    setAuction((prev) =>
      prev
        ? { ...prev, highestBid: Math.max(prev.highestBid ?? 0, bid.amount) }
        : prev,
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!auction) return <p>Auktionen hittades inte.</p>;

  const isOwnAuction = isAuthenticated && user?.username === auction.username;
  const minimumBid = auction.highestBid ?? auction.startingPrice;
  const winningBid = auction.highestBid;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Link to="/" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Tillbaka till auktioner
      </Link>

      <h1>{auction.title}</h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            background: auction.isOpen ? "#d4edda" : "#f1f1f1",
            color: auction.isOpen ? "#155724" : "#555",
            fontSize: "0.85rem",
          }}
        >
          {auction.isOpen ? "Öppen" : "Avslutad"}
        </span>
        <span style={{ color: "#777" }}>
          Skapad av <strong>{auction.username}</strong>
        </span>
      </div>

      <p style={{ whiteSpace: "pre-wrap" }}>{auction.description}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          margin: "1.5rem 0",
          padding: "1rem",
          background: "#fafafa",
          borderRadius: "8px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.8rem", color: "#777" }}>Startpris</div>
          <div>
            <strong>{auction.startingPrice} kr</strong>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.8rem", color: "#777" }}>
            {auction.isOpen ? "Högsta bud" : "Vinnande bud"}
          </div>
          <div>
            <strong>
              {winningBid !== null ? `${winningBid} kr` : "Inga bud"}
            </strong>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.8rem", color: "#777" }}>Slutdatum</div>
          <div>
            <strong>{new Date(auction.endDate).toLocaleString("sv-SE")}</strong>
          </div>
        </div>
      </div>

      {/* === Budsektion === */}
      {auction.isOpen ? (
        <>
          <h2>Lägg ett bud</h2>

          {!isAuthenticated && (
            <p>
              <Link to="/login">Logga in</Link> för att lägga ett bud.
            </p>
          )}

          {isAuthenticated && isOwnAuction && (
            <p style={{ color: "#777" }}>
              Du kan inte buda på din egen auktion.
            </p>
          )}

          {isAuthenticated && !isOwnAuction && (
            <BidForm
              auctionId={auction.id}
              minimumBid={minimumBid}
              onBidPlaced={handleBidPlaced}
            />
          )}

          <h2 style={{ marginTop: "2rem" }}>Budhistorik</h2>
          {bids.length === 0 ? (
            <p>Inga bud än.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {bids.map((b) => (
                <li
                  key={b.id}
                  style={{
                    padding: "0.75rem",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    <strong>{b.amount} kr</strong> — {b.username}
                  </span>
                  <span style={{ color: "#777" }}>
                    {new Date(b.createdAt).toLocaleString("sv-SE")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div
          style={{
            padding: "1rem",
            background: "#fafafa",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Auktionen är avslutad</h2>
          <p style={{ margin: "0.5rem 0 0" }}>
            {winningBid !== null ? (
              <>
                Vinnande bud: <strong>{winningBid} kr</strong>
              </>
            ) : (
              "Inga bud lades på denna auktion."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
