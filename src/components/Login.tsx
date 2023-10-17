import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/scss/login.scss";

const getPasswordHash = async (password: string) => {
  const utf8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
};
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const passwordInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const hash = await getPasswordHash(password);
    const response: { success: boolean; error?: string } = await (
      await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ hash }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (response.success) {
      navigate("/");
    } else {
      if (response.error) {
        alert(response.error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      passwordInput.current?.focus();
    }, 0);
  }, []);

  return (
    <div className="login-box">
      <h1>Academic Team Quiz</h1>
      <form onSubmit={onSubmit} className="login-form">
        <input
          className="password-input"
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          ref={passwordInput}
        />
        <button onClick={onSubmit} className="submit-button" disabled={loading}>
          {loading ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-loader-2 rotating"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-lock"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          Login
        </button>
      </form>
    </div>
  );
}
