import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auctionsApi } from "../api/auctionsApi";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function EditAuctionPage() {
  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  const [hasBids, setHasBids] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await auctionsApi.getById(auctionId);
        setTitle(data.title);
        setDescription(data.description);
        setStartingPrice(data.startingPrice);
        setHasBids(data.highestBid !== null);
        const formatted = new Date(data.endDate).toISOString().slice(0, 16);
        setEndDate(formatted);
      } catch {
        setError("Kunde inte hämta auktionen.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [auctionId]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await auctionsApi.update(auctionId, { title, description, endDate });
      navigate(`/auctions/${auctionId}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Kunde inte spara ändringar.");
      } else {
        setError("Något gick fel. Försök igen.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-center">
      <div className="form-card" style={{ maxWidth: 560 }}>
        <Link
          to={`/auctions/${auctionId}`}
          style={{
            display: "inline-block",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          ← Tillbaka till auktionen
        </Link>

        <h1>✏️ Redigera auktion</h1>

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
            />
          </div>

          <div className="form-group">
            <label>Beskrivning</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <label style={{ color: "var(--text-muted)" }}>
              Startpris (kr) — kan ej ändras
            </label>
            <input
              type="number"
              className="form-control"
              value={startingPrice ?? ""}
              disabled
              title="Startpris kan inte ändras"
            />
            {hasBids && (
              <small
                style={{
                  color: "var(--danger)",
                  marginTop: "0.3rem",
                  display: "block",
                }}
              >
                ⚠️ Startpris kan inte ändras eftersom det redan finns bud.
              </small>
            )}
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

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/auctions/${auctionId}`)}
              style={{ flex: 1 }}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ flex: 2 }}
            >
              {saving ? "Sparar..." : "Spara ändringar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
