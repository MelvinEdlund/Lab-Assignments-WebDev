import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auctionsApi } from "../../api/auctionsApi";
import { bidsApi } from "../../api/bidsApi";
import { useAuth } from "../../context/AuthContext";
import BidForm from "../../components/auction/BidForm/BidForm";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import type { Auction, Bid } from "../../types";
import "./AuctionDetailPage.css";

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBid, setDeletingBid] = useState(false);

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
  if (error) return <p className="auction-detail-error">{error}</p>;
  if (!auction) return <p>Auktionen hittades inte.</p>;

  const isOwnAuction = isAuthenticated && user?.username === auction.username;
  const minimumBid = auction.highestBid ?? auction.startingPrice;
  const winningBid = auction.highestBid;

  return (
    <div className="auction-detail">
      <Link
        to={isOwnAuction ? "/my-auctions" : "/"}
        className="auction-detail-back"
      >
        ← Tillbaka till {isOwnAuction ? "mina auktioner" : "auktioner"}
      </Link>

      <h1>{auction.title}</h1>
      {isOwnAuction && auction.isOpen && (
        <div className="auction-detail-edit">
          <Link
            to={`/auctions/${auction.id}/edit`}
            className="auction-detail-edit-link"
          >
            ✏️ Redigera auktion
          </Link>
        </div>
      )}
      <div className="auction-detail-meta">
        <span
          className={
            auction.isOpen
              ? "auction-detail-status-open"
              : "auction-detail-status-closed"
          }
        >
          {auction.isOpen ? "Öppen" : "Avslutad"}
        </span>
        <span className="auction-detail-owner">
          Skapad av <strong>{auction.username}</strong>
        </span>
      </div>

      <p className="auction-detail-description">{auction.description}</p>

      <div className="auction-detail-stats">
        <div>
          <div className="auction-detail-stat-label">Startpris</div>
          <div>
            <strong>{auction.startingPrice} kr</strong>
          </div>
        </div>
        <div>
          <div className="auction-detail-stat-label">
            {auction.isOpen ? "Högsta bud" : "Vinnande bud"}
          </div>
          <div>
            <strong>
              {winningBid !== null ? `${winningBid} kr` : "Inga bud"}
            </strong>
          </div>
        </div>
        <div>
          <div className="auction-detail-stat-label">Slutdatum</div>
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
            <p className="auction-detail-muted">
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

          <h2 className="auction-detail-history-title">Budhistorik</h2>
          {bids.length === 0 ? (
            <p>Inga bud än.</p>
          ) : (
            <ul className="auction-detail-bids">
              {bids.map((b, index) => {
                const isLatest = index === 0;
                const isMyBid = b.username === user?.username;
                const canDelete = isLatest && isMyBid && isAuthenticated;

                return (
                  <li key={b.id} className="auction-detail-bid-row">
                    <span>
                      <strong>{b.amount} kr</strong> — {b.username}
                      {isLatest && (
                        <span className="auction-detail-bid-tag">Högst</span>
                      )}
                    </span>
                    <div className="auction-detail-bid-meta">
                      <span className="auction-detail-bid-date">
                        {new Date(b.createdAt).toLocaleString("sv-SE")}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteBid(b)}
                          disabled={deletingBid}
                          className="auction-detail-bid-delete"
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
        <div className="auction-detail-closed">
          <h2 className="auction-detail-closed-title">Auktionen är avslutad</h2>
          <p className="auction-detail-closed-text">
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
