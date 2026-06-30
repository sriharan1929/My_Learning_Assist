import { Plus, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { schemas } from "@learning-os/shared";
import { Button } from "../components/ui/button.jsx";
import { Input, Select } from "../components/ui/input.jsx";
import { ConfirmDialog } from "../components/common/confirm-dialog.jsx";
import { FormDialog } from "../components/common/form-dialog.jsx";
import { PageHeader } from "../components/common/page-header.jsx";
import { SectionGrid } from "../components/common/data-card.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/common/states.jsx";
import { featureConfig } from "../features/resources/config.js";
import { ResourceCard } from "../features/resources/resource-card.jsx";
import { useResource } from "../hooks/use-resource.js";

export function ResourcePage({ name }) {
  const config = featureConfig[name];
  const schemaName = config.schema || name;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [flipped, setFlipped] = useState(null);
  const resource = useResource(name, { search, status });
  const [searchParams, setSearchParams] = useSearchParams();
  const itemId = searchParams.get("id");

  useEffect(() => {
    if (itemId && resource.items.length) {
      const found = resource.items.find(x => x.id === itemId);
      if (found) {
        setEditItem(found);
        setShowForm(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [itemId, resource.items, setSearchParams]);

  const defaults = useMemo(() => makeDefaults(config.fields, editItem), [config.fields, editItem]);
  const openCreate = () => { setEditItem(null); setShowForm(true); };
  const save = async values => { editItem ? await resource.update.mutateAsync({ id: editItem.id, values }) : await resource.create.mutateAsync(values); setShowForm(false); };

  if (resource.isLoading) return <LoadingState />;
  if (resource.isError) return <ErrorState onRetry={resource.refetch} />;
  const content = resource.items.length ? (config.board ? <TopicBoard items={resource.items} render={renderCard} /> : <SectionGrid columns={name === "remember" ? "three" : "three"}>{resource.items.map(renderCard)}</SectionGrid>) : <EmptyState title={`No ${config.title.toLowerCase()} yet`} action={<Button onClick={openCreate}><Plus size={17} />Create one</Button>} />;
  return <><PageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} action={<Button onClick={openCreate}><Plus size={17} />New {singular(config.title)}</Button>} />
    <div className="toolbar"><div className="search-wrap"><Search className="search-icon" size={18} /><Input className="search-input" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`} /></div>{config.filters && <Select value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option><option>Pending</option><option>In Progress</option><option>Completed</option><option>Blocked</option></Select>}</div>
    {content}
    <FormDialog open={showForm} onOpenChange={setShowForm} title={editItem ? `Edit ${singular(config.title)}` : `New ${singular(config.title)}`} fields={config.fields} schema={schemas[schemaName]} values={defaults} onSave={save} busy={resource.create.isPending || resource.update.isPending} />
    <ConfirmDialog open={Boolean(deleteItem)} onOpenChange={open => !open && setDeleteItem(null)} onConfirm={async () => { await resource.remove.mutateAsync(deleteItem.id); setDeleteItem(null); }} />
  </>;

  function renderCard(item) { return <ResourceCard key={item.id} item={item} name={name} flipped={flipped === item.id} onFlip={() => setFlipped(flipped === item.id ? null : item.id)} onEdit={() => { setEditItem(item); setShowForm(true); }} onDelete={() => setDeleteItem(item)} addNested={resource.addNested} updateNested={resource.updateNested} removeNested={resource.removeNested} />; }
}

function TopicBoard({ items, render }) { return <div className="topic-board">{["Not Started", "Learning", "Mastered"].map(status => <section className="board-column" key={status}><div className="board-title"><strong>{status}</strong><span>{items.filter(item => item.status === status).length}</span></div><div className="list">{items.filter(item => item.status === status).map(render)}</div></section>)}</div>; }
function singular(value) { return value === "Progress" ? "Goal" : value === "Questions to Remember" ? "Question" : value.endsWith("ies") ? `${value.slice(0, -3)}y` : value.endsWith("s") ? value.slice(0, -1) : value; }
function makeDefaults(fields, item) { return Object.fromEntries(fields.map(field => [field.name, item?.[field.name] ?? (field.type === "checkbox" ? false : field.type === "number" ? field.name === "target" ? 100 : field.name === "duration" ? 25 : field.name === "confidence" ? 1 : 0 : field.type === "tags" ? "" : field.type === "attachments" ? [] : field.options?.[0] || "")]).map(([key, value]) => [key, key === "tags" && Array.isArray(value) ? value.join(", ") : value])); }
