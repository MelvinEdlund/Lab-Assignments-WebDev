import { useState, type SyntheticEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }
    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken.");
      return;
    }

    setLoading(true);
    try {
      await register({ username, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Registrering misslyckades.");
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
        <h1>📝 Registrera</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Användarnamn</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="dittnamn"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="din@email.se"
            />
          </div>

          <div className="form-group">
            <label>Lösenord (minst 6 tecken)</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••"
            />
          </div>

          <div className="form-group">
            <label>Bekräfta lösenord</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Registrerar..." : "Skapa konto"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.25rem",
            fontSize: "0.9rem",
          }}
        >
          Har du redan ett konto? <Link to="/login">Logga in här</Link>
        </p>
      </div>
    </div>
  );
}
