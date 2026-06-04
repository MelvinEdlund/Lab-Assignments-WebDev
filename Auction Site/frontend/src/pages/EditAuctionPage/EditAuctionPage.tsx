import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auctionsApi } from "../../api/auctionsApi";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import "./EditAuctionPage.css";

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
      <div className="form-card edit-auction-card">
        <Link to={`/auctions/${auctionId}`} className="edit-auction-back">
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
              className="form-control edit-auction-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="form-group">
            <label className="edit-auction-label-muted">
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
              <small className="edit-auction-warning">
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

          <div className="edit-auction-actions">
            <button
              type="button"
              className="btn btn-ghost edit-auction-action-cancel"
              onClick={() => navigate(`/auctions/${auctionId}`)}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="btn btn-primary edit-auction-action-submit"
              disabled={saving}
            >
              {saving ? "Sparar..." : "Spara ändringar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
