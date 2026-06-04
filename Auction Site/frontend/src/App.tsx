import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar/Navbar";
import PrivateRoute from "./components/common/PrivateRoute/PrivateRoute";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ChangePasswordPage from "./pages/ChangePasswordPage/ChangePasswordPage";
import AuctionsPage from "./pages/AuctionsPage/AuctionsPage";
import MyAuctionsPage from "./pages/MyAuctionsPage/MyAuctionsPage";
import EditAuctionPage from "./pages/EditAuctionPage/EditAuctionPage";
import AuctionDetailPage from "./pages/AuctionDetailPage/AuctionDetailPage";
import CreateAuctionPage from "./pages/CreateAuctionPage/CreateAuctionPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<AuctionsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />
          <Route
            path="/auctions/:id/edit"
            element={
              <PrivateRoute>
                <EditAuctionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateAuctionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-auctions"
            element={
              <PrivateRoute>
                <MyAuctionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
