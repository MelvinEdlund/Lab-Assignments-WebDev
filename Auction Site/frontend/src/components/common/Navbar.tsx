import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    close();
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-brand" onClick={close}>
        🏷️ Auktioner
      </Link>

      {/* Hamburger-knapp (visas bara på mobil) */}
      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Öppna meny"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Nav-länkarna */}
      <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <div className="navbar-links">
          <Link to="/" onClick={close}>
            Auktioner
          </Link>
          {isAuthenticated && (
            <Link to="/create" onClick={close}>
              Skapa auktion
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={close}>
              Admin
            </Link>
          )}
        </div>

        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <span className="navbar-username">
                👤 <strong>{user?.username}</strong>
              </span>
              <Link
                to="/change-password"
                onClick={close}
                className="navbar-link-small"
              >
                Ändra lösenord
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logga ut
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close}>
                Logga in
              </Link>
              <Link
                to="/register"
                onClick={close}
                className="btn btn-primary btn-sm"
              >
                Registrera
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
