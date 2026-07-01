import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import { SearchBox } from "./search-box.jsx";
import { Sidebar } from "./sidebar.jsx";

export function AppShell({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const crumb = location.pathname === "/" ? "Dashboard" : location.pathname.split("/")[1].replaceAll("-", " ");
  return (
    <div className="app-shell">
      {menuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMenuOpen(false)} 
          aria-hidden="true"
        />
      )}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={onLogout} user={user} />
      <div className="main">
        <header className="topbar">
          <Button className="menu-button" variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <SearchBox />
          <div className="profile">
            <span className="avatar">{user.name.slice(0, 1)}</span>
            <div className="profile-copy">
              <strong>{user.name}</strong>
              <span>{crumb}</span>
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
