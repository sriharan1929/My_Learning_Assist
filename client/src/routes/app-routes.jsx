import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/app-shell.jsx";
import { DashboardPage } from "../pages/dashboard-page.jsx";
import { FocusPage } from "../pages/focus-page.jsx";
import { LoginPage } from "../pages/login-page.jsx";
import { ResourcePage } from "../pages/resource-page.jsx";
import { featureConfig } from "../features/resources/config.js";

export function AppRoutes({ user, loading, onLogin, onLogout }) {
  if (loading) return null;
  if (!user) return <Routes><Route path="*" element={<LoginPage onLogin={onLogin} />} /></Routes>;
  return <Routes><Route element={<AppShell user={user} onLogout={onLogout} />}><Route index element={<DashboardPage />} /><Route path="focus" element={<FocusPage />} />{Object.keys(featureConfig).map(name => <Route key={name} path={name} element={<ResourcePage name={name} />} />)}<Route path="*" element={<Navigate to="/" replace />} /></Route></Routes>;
}
