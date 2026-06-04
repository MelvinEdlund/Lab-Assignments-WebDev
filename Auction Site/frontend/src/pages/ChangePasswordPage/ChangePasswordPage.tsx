import { useState, type SyntheticEvent } from "react";
import axios from "axios";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./ChangePasswordPage.css";

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
    <div className="page-center">
      <div className="form-card">
        <h1>🔑 Ändra lösenord</h1>
        <p className="change-password-subtitle">
          Inloggad som <strong>{user?.username}</strong>
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            ✅ Lösenordet har uppdaterats!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nuvarande lösenord</label>
            <input
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••"
            />
          </div>

          <div className="form-group">
            <label>Nytt lösenord</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••"
            />
          </div>

          <div className="form-group">
            <label>Bekräfta nytt lösenord</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary change-password-submit"
            disabled={loading}
          >
            {loading ? "Sparar..." : "Byt lösenord"}
          </button>
        </form>
      </div>
    </div>
  );
}
