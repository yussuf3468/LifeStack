import type { FormEvent } from "react";

interface AuthScreenProps {
  email: string;
  password: string;
  errorMessage: string;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AuthScreen({
  email,
  password,
  errorMessage,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthScreenProps) {
  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <article className="auth-box">
        <header className="auth-header">
          <div className="auth-mark">LS</div>
          <p className="auth-bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your personal dashboard</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </article>
    </div>
  );
}
