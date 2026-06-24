import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@learning-os/shared";
import { ArrowRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

export function LoginPage({ onLogin }) {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "demo@learningos.dev", password: "learn123" } });
  const submit = async values => { try { await onLogin(values); } catch (error) { setError("root", { message: error.message || "Unable to sign in" }); } };
  return <main className="login-page"><section className="login-art"><div className="brand"><span className="brand-mark">LO</span><strong>My Learning OS</strong></div><div><Sparkles /><h1>Make your learning feel alive.</h1><p>One calm home for the ideas you collect, the skills you practice, and the progress you build every day.</p></div><small>Thoughtful structure. Less noise. Better momentum.</small></section><section className="login-panel"><div className="login-card"><p className="eyebrow">Welcome back</p><h2>Continue learning</h2><p className="page-description">Sign in to your personal learning workspace.</p><form className="login-form" onSubmit={handleSubmit(submit)}><div className="field"><label htmlFor="email">Email</label><Input id="email" type="email" {...register("email")} />{errors.email && <span className="field-error">{errors.email.message}</span>}</div><div className="field"><label htmlFor="password">Password</label><Input id="password" type="password" {...register("password")} />{errors.password && <span className="field-error">{errors.password.message}</span>}</div>{errors.root && <p className="form-alert">{errors.root.message}</p>}<Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : <>Sign in <ArrowRight size={17} /></>}</Button><p className="login-hint">Demo access: demo@learningos.dev · learn123</p></form></div></section></main>;
}
