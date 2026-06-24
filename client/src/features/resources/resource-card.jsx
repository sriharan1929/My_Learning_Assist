import { Check, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDate, getProgress } from "../../lib/utils.js";
import { Button } from "../../components/ui/button.jsx";
import { DataCard } from "../../components/common/data-card.jsx";
import { PriorityBadge, ProgressBar, StatusBadge } from "../../components/common/status.jsx";
import { Input, Select } from "../../components/ui/input.jsx";

export function ResourceCard({ item, name, onEdit, onDelete, flipped, onFlip, addNested, updateNested, removeNested }) {
  const [expanded, setExpanded] = useState(false);
  const [newText, setNewText] = useState("");
  const title = item.title || item.name || item.question;

  if (name === "remember") return <DataCard onClick={onFlip}><div className={flipped ? "flashcard flashcard-answer" : "flashcard"}><div><small className="eyebrow">{flipped ? "Answer" : "Question"}</small><h3>{flipped ? item.answer : item.question}</h3></div><div><p className="card-copy">{flipped ? "Click to see the question" : "Think first, then reveal the answer"}</p><CardActions onEdit={onEdit} onDelete={onDelete} /></div></div></DataCard>;
  const progress = getProgress(item);

  const hasSubItems = name === "roadmaps" || name === "checklists" || name === "custom-modules";
  const subItems = name === "roadmaps" ? item.steps : item.items;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    if (name === "roadmaps") {
      addNested.mutate({ id: item.id, field: "steps", values: { title: newText.trim(), done: false } });
    } else if (name === "checklists") {
      addNested.mutate({ id: item.id, field: "items", values: { text: newText.trim(), done: false } });
    } else if (name === "custom-modules") {
      addNested.mutate({ id: item.id, field: "items", values: { title: newText.trim(), description: "", status: "Pending", priority: "Medium" } });
    }
    setNewText("");
  };

  return <DataCard><div className="card-head"><h3>{title}</h3>{item.pinned && <Check size={17} aria-label="Pinned" />}</div>
    <p className="card-copy">{item.content || item.description || item.notes || item.mood || "Ready when you are."}</p>
    <div className="meta-row">{item.status && <StatusBadge value={item.status} />}{item.priority && <PriorityBadge value={item.priority} />}{item.type && <span>{item.type}</span>}{item.dueDate && <span>Due {formatDate(item.dueDate)}</span>}{item.plannedDate && <span>{formatDate(item.plannedDate)} · {item.duration} min</span>}{item.deadline && <span>Target {formatDate(item.deadline)}</span>}</div>
    {(item.steps || item.items || item.target) && <><ProgressBar value={progress} /><div className="meta-row"><span>{progress}% complete</span>{item.target && <span>{item.current} / {item.target} {item.unit}</span>}{item.steps && <span>{item.steps.length} steps</span>}{item.items && <span>{item.items.length} items</span>}</div></>}
    <div className="card-actions">
      {item.url && <Button variant="secondary" size="small" onClick={() => window.open(item.url, "_blank", "noopener")}><ExternalLink size={14} />Open</Button>}
      {hasSubItems && (
        <Button variant="secondary" size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide steps" : `Manage (${(subItems || []).length})`}
        </Button>
      )}
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </div>

    {hasSubItems && expanded && (
      <div style={{ marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
        <h4 style={{ fontSize: "0.88rem", fontWeight: "700", marginBottom: "12px" }}>
          {name === "roadmaps" ? "Roadmap Steps" : name === "checklists" ? "Checklist Items" : "Module Items"}
        </h4>
        <div style={{ display: "grid", gap: "10px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
          {(subItems || []).map((nested, idx) => {
            const isCompleted = name === "custom-modules" ? nested.status === "Completed" : nested.done;
            return (
              <div key={nested.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "6px 0", borderBottom: "1px dashed var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  {name !== "custom-modules" ? (
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => updateNested.mutate({
                        id: item.id,
                        field: name === "roadmaps" ? "steps" : "items",
                        nestedId: nested.id,
                        values: { done: !nested.done }
                      })}
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                  ) : null}
                  <span style={{
                    fontSize: "0.88rem",
                    textDecoration: isCompleted ? "line-through" : "none",
                    opacity: isCompleted ? 0.6 : 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {name === "roadmaps" ? `${idx + 1}. ${nested.title}` : name === "checklists" ? nested.text : nested.title}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {name === "custom-modules" && (
                    <>
                      <Select
                        value={nested.status || "Pending"}
                        onChange={e => updateNested.mutate({
                          id: item.id,
                          field: "items",
                          nestedId: nested.id,
                          values: { status: e.target.value }
                        })}
                        style={{ minHeight: "26px", height: "26px", padding: "0 6px", fontSize: "0.78rem", width: "100px", borderRadius: "6px" }}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Blocked</option>
                      </Select>
                      <Select
                        value={nested.priority || "Medium"}
                        onChange={e => updateNested.mutate({
                          id: item.id,
                          field: "items",
                          nestedId: nested.id,
                          values: { priority: e.target.value }
                        })}
                        style={{ minHeight: "26px", height: "26px", padding: "0 6px", fontSize: "0.78rem", width: "80px", borderRadius: "6px" }}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </Select>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNested.mutate({
                      id: item.id,
                      field: name === "roadmaps" ? "steps" : "items",
                      nestedId: nested.id
                    })}
                    style={{ width: "24px", height: "24px" }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
          {!(subItems || []).length && (
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0" }}>No steps or items added yet.</p>
          )}
        </div>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <Input
            style={{ minHeight: "34px", padding: "6px 10px", fontSize: "0.84rem" }}
            placeholder={name === "roadmaps" ? "Add roadmap step..." : name === "checklists" ? "Add checklist item..." : "Add module item..."}
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <Button type="submit" size="small" style={{ height: "34px", minHeight: "34px" }}>Add</Button>
        </form>
      </div>
    )}
  </DataCard>;
}

function CardActions({ onEdit, onDelete }) { return <><Button variant="ghost" size="icon" aria-label="Edit" onClick={event => { event.stopPropagation(); onEdit(); }}><Pencil size={16} /></Button><Button variant="ghost" size="icon" aria-label="Delete" onClick={event => { event.stopPropagation(); onDelete(); }}><Trash2 size={16} /></Button></>; }
