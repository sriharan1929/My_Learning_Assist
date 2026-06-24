import { Button } from "../ui/button.jsx";
import { AppDialog } from "../ui/dialog.jsx";

export function ConfirmDialog({ open, onOpenChange, onConfirm }) {
  return <AppDialog open={open} onOpenChange={onOpenChange} title="Delete this item?" description="This action cannot be undone." footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="danger" onClick={onConfirm}>Delete</Button></>}><p className="card-copy">The item will be removed from this demo workspace immediately.</p></AppDialog>;
}
