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
        // Formatera datumet till "YYYY-MM-DDThh:mm" som datetime-local kräver
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
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Link
        to={`/auctions/${auctionId}`}
        style={{ display: "inline-block", marginBottom: "1rem" }}
      >
        ← Tillbaka till auktionen
      </Link>

      <h1>Redigera auktion</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
      >
        <label>
          Titel
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
            }}
          />
        </label>

        <label>
          Beskrivning
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
            }}
          />
        </label>

        <label style={{ color: hasBids ? "#888" : "inherit" }}>
          Startpris (kr)
          <input
            type="number"
            value={startingPrice ?? ""}
            disabled
            title={
              hasBids
                ? "Startpris kan inte ändras när det finns bud"
                : "Startpris kan inte ändras"
            }
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
              background: "#f5f5f5",
              cursor: "not-allowed",
            }}
          />
          {hasBids && (
            <small style={{ color: "#e74c3c" }}>
              Startpris kan inte ändras eftersom det redan finns bud.
            </small>
          )}
        </label>

        <label>
          Slutdatum
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
            }}
          />
        </label>

        {error && <p style={{ color: "#e74c3c", margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ padding: "0.6rem", fontSize: "1rem" }}
        >
          {saving ? "Sparar..." : "Spara ändringar"}
        </button>
      </form>
    </div>
  );
}
