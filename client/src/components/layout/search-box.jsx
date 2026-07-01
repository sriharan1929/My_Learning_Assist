import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { Input } from "../ui/input.jsx";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const { data = [] } = useQuery({ queryKey: ["search", query], queryFn: async () => (await api.get("/search", { params: { q: query } })).data, enabled: query.length > 1 });
  return <div className="search-wrap"><Search className="search-icon" size={18} /><Input className="search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search everything…" aria-label="Search everything" />{query.length > 1 && <div className="search-results">{data.length ? data.map(item => <Link className="search-result" key={`${item.type}-${item.id}`} to={`${item.path}?id=${item.id}`} onClick={() => setQuery("")}><small>{item.type}</small><strong>{item.title}</strong></Link>) : <div className="search-result">No matches found</div>}</div>}</div>;
}
