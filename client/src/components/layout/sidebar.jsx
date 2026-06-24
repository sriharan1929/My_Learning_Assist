import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navGroups } from "../../features/resources/config.js";
import { Button } from "../ui/button.jsx";

export function Sidebar({ open, onClose, onLogout, user }) {
  const isDemo = user?.isDemo !== false;
  return <aside className={open ? "sidebar open" : "sidebar"}><div className="brand"><span className="brand-mark">LO</span><div className="brand-text"><strong>My Learning OS</strong><span>Learn with intention</span></div></div><nav className="nav-scroll">{navGroups.map(group => <div key={group.label}><p className="nav-group">{group.label}</p>{group.items.map(([path, label, Icon]) => <NavLink end={path === "/"} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} key={path} to={path} onClick={onClose}><Icon size={18} />{label}</NavLink>)}</div>)}</nav><footer className="sidebar-foot"><p className="demo-label">{isDemo ? "Demo workspace · resets on server restart" : "Database workspace · persistent storage"}</p><Button variant="ghost" onClick={onLogout}><LogOut size={17} />Sign out</Button></footer></aside>;
}
