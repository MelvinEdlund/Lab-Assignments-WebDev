import { useState, type SyntheticEvent } from "react";
import axios from "axios";
import { bidsApi } from "../../../api/bidsApi";
import type { Bid } from "../../../types";
import "./BidForm.css";

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
    <form onSubmit={handleSubmit} className="bid-form">
      <div className="bid-form-field">
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
          className="bid-form-input"
        />
        {error && <p className="bid-form-error">{error}</p>}
      </div>

      <button type="submit" disabled={loading} className="bid-form-submit">
        {loading ? "Lägger bud..." : "Lägg bud"}
      </button>
    </form>
  );
}
