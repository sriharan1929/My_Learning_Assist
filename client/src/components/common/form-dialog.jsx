import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button.jsx";
import { AppDialog } from "../ui/dialog.jsx";
import { Input, Select, Textarea } from "../ui/input.jsx";

export function FormDialog({ open, onOpenChange, title, fields, schema, values, onSave, busy }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: values });
  useEffect(() => { reset(values); }, [values, reset]);
  const submit = handleSubmit(data => onSave(normalize(data)));
  return <AppDialog open={open} onOpenChange={onOpenChange} title={title} description="Fields marked by validation must be corrected before saving." footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></>}>
    <form className="form-grid" onSubmit={submit}>
      {fields.map(field => <Field key={field.name} field={field} register={register} error={errors[field.name]?.message} />)}
    </form>
  </AppDialog>;
}

function Field({ field, register, error }) {
  const className = field.wide ? "field field-wide" : "field";
  if (field.type === "checkbox") return <label className={`${className} check-field`}><input type="checkbox" {...register(field.name)} />{field.label}</label>;
  return <div className={className}><label htmlFor={field.name}>{field.label}</label>{field.type === "textarea" ? <Textarea id={field.name} {...register(field.name)} /> : field.type === "select" ? <Select id={field.name} {...register(field.name)}>{field.options.map(option => <option key={option}>{option}</option>)}</Select> : <Input id={field.name} type={field.type === "tags" ? "text" : field.type || "text"} {...register(field.name)} />}{error && <span className="field-error">{error}</span>}</div>;
}

function normalize(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, key === "tags" && typeof value === "string" ? value.split(",").map(tag => tag.trim()).filter(Boolean) : value]));
}
