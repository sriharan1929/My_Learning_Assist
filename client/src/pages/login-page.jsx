import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@learning-os/shared";
import { ArrowRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

export function LoginPage({ onLogin, onRegister }) {
  const [isSignUp, setIsSignUp] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@learningos.dev", password: "learn123" }
  });

  const signUpForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const onLoginSubmit = async values => {
    try {
      await onLogin(values);
    } catch (error) {
      loginForm.setError("root", { message: error.message || "Unable to sign in" });
    }
  };

  const onSignUpSubmit = async values => {
    try {
      await onRegister(values);
    } catch (error) {
      signUpForm.setError("root", { message: error.message || "Unable to register account" });
    }
  };

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="brand">
          <span className="brand-mark">LO</span>
          <strong>My Learning OS</strong>
        </div>
        <div>
          <Sparkles />
          <h1>Make your learning feel alive.</h1>
          <p>One calm home for the ideas you collect, the skills you practice, and the progress you build every day.</p>
        </div>
        <small>Thoughtful structure. Less noise. Better momentum.</small>
      </section>
      <section className="login-panel">
        <div className="login-card">
          {!isSignUp ? (
            <>
              <p className="eyebrow">Welcome back</p>
              <h2>Continue learning</h2>
              <p className="page-description">Sign in to your personal learning workspace.</p>
              <form className="login-form" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <Input id="email" type="email" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && <span className="field-error">{loginForm.formState.errors.email.message}</span>}
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <Input id="password" type="password" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && <span className="field-error">{loginForm.formState.errors.password.message}</span>}
                </div>
                {loginForm.formState.errors.root && <p className="form-alert">{loginForm.formState.errors.root.message}</p>}
                <Button type="submit" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? "Signing in…" : <>Sign in <ArrowRight size={17} /></>}
                </Button>
                <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setIsSignUp(true)} style={{ background: "none", border: "none", color: "var(--color-primary, #A1775D)", textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}>
                    Sign up
                  </button>
                </div>
                <p className="login-hint">Demo access: demo@learningos.dev · learn123</p>
              </form>
            </>
          ) : (
            <>
              <p className="eyebrow">Get started</p>
              <h2>Create an account</h2>
              <p className="page-description">Start your personal learning workspace today.</p>
              <form className="login-form" onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}>
                <div className="field">
                  <label htmlFor="register-name">Name</label>
                  <Input id="register-name" type="text" placeholder="Alex Morgan" {...signUpForm.register("name")} />
                  {signUpForm.formState.errors.name && <span className="field-error">{signUpForm.formState.errors.name.message}</span>}
                </div>
                <div className="field">
                  <label htmlFor="register-email">Email</label>
                  <Input id="register-email" type="email" placeholder="alex@example.com" {...signUpForm.register("email")} />
                  {signUpForm.formState.errors.email && <span className="field-error">{signUpForm.formState.errors.email.message}</span>}
                </div>
                <div className="field">
                  <label htmlFor="register-password">Password</label>
                  <Input id="register-password" type="password" {...signUpForm.register("password")} />
                  {signUpForm.formState.errors.password && <span className="field-error">{signUpForm.formState.errors.password.message}</span>}
                </div>
                {signUpForm.formState.errors.root && <p className="form-alert">{signUpForm.formState.errors.root.message}</p>}
                <Button type="submit" disabled={signUpForm.formState.isSubmitting}>
                  {signUpForm.formState.isSubmitting ? "Creating account…" : <>Sign up <ArrowRight size={17} /></>}
                </Button>
                <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setIsSignUp(false)} style={{ background: "none", border: "none", color: "var(--color-primary, #A1775D)", textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}>
                    Sign in
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

