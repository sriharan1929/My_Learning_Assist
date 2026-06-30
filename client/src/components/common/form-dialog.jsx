import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FileText, FileImage, File, X, Upload } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { AppDialog } from "../ui/dialog.jsx";
import { Input, Select, Textarea } from "../ui/input.jsx";
import { api } from "../../services/api.js";

export function FormDialog({ open, onOpenChange, title, fields, schema, values, onSave, busy }) {
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({ resolver: zodResolver(schema), defaultValues: values });
  useEffect(() => { reset(values); }, [values, reset]);
  const submit = handleSubmit(data => onSave(normalize(data)));
  return <AppDialog open={open} onOpenChange={onOpenChange} title={title} description="Fields marked by validation must be corrected before saving." footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></>}>
    <form className="form-grid" onSubmit={submit}>
      {fields.map(field => {
        if (field.type === "attachments") {
          return <AttachmentsField key={field.name} field={field} attachments={watch(field.name) || []} onChange={val => setValue(field.name, val)} error={errors[field.name]?.message} />;
        }
        return <Field key={field.name} field={field} register={register} error={errors[field.name]?.message} />;
      })}
    </form>
  </AppDialog>;
}

function AttachmentsField({ field, attachments, onChange, error }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onChange([...attachments, res.data]);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.error || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (idxToRemove) => {
    onChange(attachments.filter((_, idx) => idx !== idxToRemove));
  };

  return <div className="field field-wide" style={{ display: "flex", flexDirection: "column", gap: "8px" }}><label>{field.label}</label>{attachments.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "4px" }}>{attachments.map((file, idx) => {
    const isImage = file.type?.startsWith("image/");
    const Icon = isImage ? FileImage : file.type?.includes("pdf") ? FileText : File;
    return <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "8px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><Icon size={16} style={{ color: "var(--clay-brown)", flexShrink: 0 }} /><span style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>{file.size && <span style={{ fontSize: "0.75rem", color: "var(--muted)", flexShrink: 0 }}>({(file.size / 1024).toFixed(1)} KB)</span>}</div><button type="button" onClick={() => handleRemove(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "2px", display: "flex", alignItems: "center" }}><X size={14} /></button></div>;
  })}</div>}<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><label className="button button-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: uploading ? "not-allowed" : "pointer", margin: 0, padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600" }}><Upload size={14} />{uploading ? "Uploading..." : "Upload File"}<input type="file" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} /></label>{uploading && <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Saving to server...</span>}</div>{(error || uploadError) && <span className="field-error">{error || uploadError}</span>}</div>;
}

function Field({ field, register, error }) {
  const className = field.wide ? "field field-wide" : "field";
  if (field.type === "checkbox") return <label className={`${className} check-field`}><input type="checkbox" {...register(field.name)} />{field.label}</label>;
  return <div className={className}><label htmlFor={field.name}>{field.label}</label>{field.type === "textarea" ? <Textarea id={field.name} {...register(field.name)} /> : field.type === "select" ? <Select id={field.name} {...register(field.name)}>{field.options.map(option => <option key={option}>{option}</option>)}</Select> : <Input id={field.name} type={field.type === "tags" ? "text" : field.type || "text"} {...register(field.name)} />}{error && <span className="field-error">{error}</span>}</div>;
}

function normalize(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, key === "tags" && typeof value === "string" ? value.split(",").map(tag => tag.trim()).filter(Boolean) : value]));
}
