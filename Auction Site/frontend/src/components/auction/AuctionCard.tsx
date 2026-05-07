import { Link } from "react-router-dom";
import type { Auction } from "../../types";

interface Props {
  auction: Auction;
}

export default function AuctionCard({ auction }: Props) {
  const currentPrice = auction.highestBid ?? auction.startingPrice;
  const endDate = new Date(auction.endDate).toLocaleString("sv-SE");

  return (
    <Link
      to={`/auctions/${auction.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        display: "block",
        background: "#fff",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem" }}>{auction.title}</h3>
      <p style={{ margin: "0 0 0.5rem", color: "#555", fontSize: "0.9rem" }}>
        {auction.description.length > 100
          ? auction.description.slice(0, 100) + "..."
          : auction.description}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.9rem",
        }}
      >
        <span>
          <strong>{currentPrice} kr</strong>
        </span>
        <span style={{ color: auction.isOpen ? "green" : "gray" }}>
          {auction.isOpen ? "Öppen" : "Avslutad"}
        </span>
      </div>
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#777" }}>
        Skapad av {auction.username} • Slutar {endDate}
      </div>
    </Link>
  );
}
