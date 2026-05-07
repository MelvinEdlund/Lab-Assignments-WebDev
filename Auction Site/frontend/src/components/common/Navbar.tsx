import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  return (
    <nav
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ccc",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <Link to="/">Auktioner</Link>
      {isAuthenticated && <Link to="/create">Skapa auktion</Link>}
      {isAdmin && <Link to="/admin">Admin</Link>}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {isAuthenticated ? (
          <>
            <span>
              Inloggad som <strong>{user?.username}</strong>
            </span>
            <button onClick={logout}>Logga ut</button>
          </>
        ) : (
          <>
            <Link to="/login">Logga in</Link>
            <Link to="/register">Registrera</Link>
          </>
        )}
      </div>
    </nav>
  );
}
