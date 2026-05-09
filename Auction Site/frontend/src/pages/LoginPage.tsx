import { useState, type SyntheticEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Inloggning misslyckades.");
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
        <h1>🔐 Logga in</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label>Lösenord</label>
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.25rem",
            fontSize: "0.9rem",
          }}
        >
          Har du inget konto? <Link to="/register">Registrera dig här</Link>
        </p>
      </div>
    </div>
  );
}
