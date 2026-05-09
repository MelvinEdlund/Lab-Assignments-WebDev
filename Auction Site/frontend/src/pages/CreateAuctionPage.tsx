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
    <div className="page-center">
      <div className="form-card" style={{ maxWidth: 540 }}>
        <h1>🏷️ Skapa auktion</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titel</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              placeholder="Vad säljer du?"
            />
          </div>

          <div className="form-group">
            <label>Beskrivning</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{ resize: "vertical" }}
              placeholder="Beskriv föremålet..."
            />
          </div>

          <div className="form-group">
            <label>Startpris (kr)</label>
            <input
              type="number"
              className="form-control"
              value={startingPrice}
              onChange={(e) =>
                setStartingPrice(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              required
              min={1}
              step="0.01"
              placeholder="0"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label>Startdatum</label>
              <input
                type="datetime-local"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Slutdatum</label>
              <input
                type="datetime-local"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/")}
              style={{ flex: 1 }}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? "Skapar..." : "Skapa auktion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
