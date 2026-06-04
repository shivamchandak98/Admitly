import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CityProvider } from "@/context/CityContext";
import Navbar from "@/components/Navbar";
import AuthCallback from "@/components/AuthCallback";
import Landing from "@/pages/Landing";
import SchoolsList from "@/pages/SchoolsList";
import SchoolDetail from "@/pages/SchoolDetail";
import Dashboard from "@/pages/Dashboard";
import Favourites from "@/pages/Favourites";
import Login from "@/pages/Login";
import { Toaster } from "@/components/ui/sonner";

function AppRouter() {
  const location = useLocation();
  // Synchronous check - critical: prevents race conditions with /auth/me
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/schools" element={<SchoolsList />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CityProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </CityProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
