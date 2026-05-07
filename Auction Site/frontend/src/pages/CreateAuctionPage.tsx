import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auctionsApi } from "../api/auctionsApi";

export default function CreateAuctionPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (!startingPrice || startingPrice < 1) {
      setError("Startpris måste vara minst 1.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Ogiltigt datum.");
      return;
    }
    if (end <= start) {
      setError("Slutdatum måste vara efter startdatum.");
      return;
    }
    if (end <= new Date()) {
      setError("Slutdatum måste vara i framtiden.");
      return;
    }

    setLoading(true);
    try {
      const created = await auctionsApi.create({
        title,
        description,
        startingPrice: Number(startingPrice),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      navigate(`/auctions/${created.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Kunde inte skapa auktion.");
      } else {
        setError("Något gick fel.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h1>Skapa auktion</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Titel
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        <label>
          Beskrivning
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: "100%", padding: "0.5rem", resize: "vertical" }}
          />
        </label>

        <label>
          Startpris (kr)
          <input
            type="number"
            value={startingPrice}
            onChange={(e) =>
              setStartingPrice(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            required
            min={1}
            step="0.01"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        <label>
          Startdatum
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        <label>
          Slutdatum
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ padding: "0.6rem", flex: 1 }}
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "0.6rem", flex: 2 }}
          >
            {loading ? "Skapar..." : "Skapa auktion"}
          </button>
        </div>
      </form>
    </div>
  );
}
