import { useState, type SyntheticEvent } from "react";
import axios from "axios";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Det nya lösenordet och bekräftelsen matchar inte.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Nytt lösenord måste vara minst 6 tecken.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Något gick fel.");
      } else {
        setError("Något gick fel. Försök igen.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Ändra lösenord</h1>
      <p style={{ color: "#666" }}>
        Inloggad som <strong>{user?.username}</strong>
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginTop: "1.5rem",
        }}
      >
        <label>
          Nuvarande lösenord
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
          Nytt lösenord
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={{
              display: "block",
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.25rem",
            }}
          />
        </label>

        <label>
          Bekräfta nytt lösenord
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        {success && (
          <p style={{ color: "#27ae60", margin: 0 }}>
            ✅ Lösenordet har uppdaterats!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.6rem", fontSize: "1rem" }}
        >
          {loading ? "Sparar..." : "Byt lösenord"}
        </button>
      </form>
    </div>
  );
}
