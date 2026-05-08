import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const [deletingBid, setDeletingBid] = useState(false); // ← NY RAD

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

  const handleDeleteBid = async (bid: Bid) => {
    if (!window.confirm("Vill du ångra ditt bud?")) return;
    setDeletingBid(true);
    try {
      await bidsApi.delete(bid.id, auctionId);
      const updatedBids = bids.filter((b) => b.id !== bid.id);
      setBids(updatedBids);
      setAuction((prev) =>
        prev ? { ...prev, highestBid: updatedBids[0]?.amount ?? null } : prev,
      );
    } catch {
      setError("Kunde inte ta bort budet. Försök igen.");
    } finally {
      setDeletingBid(false);
    }
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
      {isOwnAuction && auction.isOpen && (
        <div style={{ marginBottom: "1rem" }}>
          <Link
            to={`/auctions/${auction.id}/edit`}
            style={{
              display: "inline-block",
              padding: "0.4rem 1rem",
              background: "#2c3e50",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            ✏️ Redigera auktion
          </Link>
        </div>
      )}
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
              {bids.map((b, index) => {
                const isLatest = index === 0;
                const isMyBid = b.username === user?.username;
                const canDelete = isLatest && isMyBid && isAuthenticated;

                return (
                  <li
                    key={b.id}
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>{b.amount} kr</strong> — {b.username}
                      {isLatest && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.75rem",
                            background: "#fff3cd",
                            color: "#856404",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                          }}
                        >
                          Högst
                        </span>
                      )}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#777", fontSize: "0.85rem" }}>
                        {new Date(b.createdAt).toLocaleString("sv-SE")}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteBid(b)}
                          disabled={deletingBid}
                          style={{
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.8rem",
                            background: "transparent",
                            border: "1px solid #e74c3c",
                            color: "#e74c3c",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          {deletingBid ? "..." : "Ångra"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
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
