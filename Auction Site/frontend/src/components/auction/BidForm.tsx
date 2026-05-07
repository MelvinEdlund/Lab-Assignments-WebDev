import { useState, type SyntheticEvent } from "react";
import axios from "axios";
import { bidsApi } from "../../api/bidsApi";
import type { Bid } from "../../types";

interface Props {
  auctionId: number;
  minimumBid: number;
  onBidPlaced: (bid: Bid) => void;
}

export default function BidForm({ auctionId, minimumBid, onBidPlaced }: Props) {
  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || amount <= minimumBid) {
      setError(`Budet måste vara högre än ${minimumBid} kr.`);
      return;
    }

    setLoading(true);
    try {
      const bid = await bidsApi.create(auctionId, { amount: Number(amount) });
      onBidPlaced(bid);
      setAmount("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Kunde inte lägga bud.");
      } else {
        setError("Något gick fel.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "0.5rem",
        marginTop: "1rem",
        padding: "1rem",
        background: "#f7f7f7",
        borderRadius: "8px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 180 }}>
        <input
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder={`Min ${minimumBid + 1} kr`}
          min={minimumBid + 1}
          step="0.01"
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
        {error && <p style={{ color: "red", margin: "0.5rem 0 0" }}>{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ padding: "0.5rem 1.5rem" }}
      >
        {loading ? "Lägger bud..." : "Lägg bud"}
      </button>
    </form>
  );
}
