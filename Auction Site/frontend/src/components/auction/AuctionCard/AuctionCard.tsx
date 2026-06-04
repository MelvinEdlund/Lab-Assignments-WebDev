import { Link } from "react-router-dom";
import type { Auction } from "../../../types";
import "./AuctionCard.css";

interface Props {
  auction: Auction;
}

export default function AuctionCard({ auction }: Props) {
  const currentPrice = auction.highestBid ?? auction.startingPrice;
  const endDate = new Date(auction.endDate).toLocaleString("sv-SE");

  return (
    <Link to={`/auctions/${auction.id}`} className="auction-card">
      <div className="auction-card-header">
        <h3 className="auction-card-title">{auction.title}</h3>
        <span
          className={`badge ${auction.isOpen ? "badge-success" : "badge-muted"}`}
        >
          {auction.isOpen ? "Öppen" : "Avslutad"}
        </span>
      </div>

      <p className="auction-card-desc">
        {auction.description.length > 100
          ? auction.description.slice(0, 100) + "..."
          : auction.description}
      </p>

      <div className="auction-card-footer">
        <span className="auction-card-price">
          <strong>{currentPrice} kr</strong>
          {auction.highestBid && (
            <span className="auction-card-bid-label"> (högsta bud)</span>
          )}
        </span>
        <span className="auction-card-meta">av {auction.username}</span>
      </div>

      <div className="auction-card-date">Slutar {endDate}</div>
    </Link>
  );
}
