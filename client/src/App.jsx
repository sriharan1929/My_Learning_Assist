import { useEffect, useState } from "react";
import { api } from "./services/api.js";
import { AppRoutes } from "./routes/app-routes.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const load = async () => { if (!localStorage.getItem("learningOsToken")) return setLoading(false); try { setUser((await api.get("/auth/me")).data); } finally { setLoading(false); } }; load(); const expired = () => setUser(null); window.addEventListener("learning-os-auth-expired", expired); return () => window.removeEventListener("learning-os-auth-expired", expired); }, []);
  const login = async values => { const data = (await api.post("/auth/login", values)).data; localStorage.setItem("learningOsToken", data.token); setUser(data.user); };
  const logout = async () => { try { await api.post("/auth/logout"); } finally { localStorage.removeItem("learningOsToken"); setUser(null); } };
  return <AppRoutes user={user} loading={loading} onLogin={login} onLogout={logout} />;
}
