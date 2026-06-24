import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

export const Input = forwardRef(function Input({ className, ...props }, ref) { return <input ref={ref} className={cn("input", className)} {...props} />; });
export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) { return <textarea ref={ref} className={cn("input textarea", className)} {...props} />; });
export const Select = forwardRef(function Select({ className, ...props }, ref) { return <select ref={ref} className={cn("input select", className)} {...props} />; });
