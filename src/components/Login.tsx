import { Loader2, Lock } from "lucide-react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex flex-col absolute gap-8 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-4 p-12">
      <h1 className="text-2xl text-center shrink-0">Academic Team Quiz</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          className="p-2 rounded-lg border-2"
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          ref={passwordInput}
        />
        <button
          onClick={onSubmit}
          className="bg-green-500 border-2 rounded-lg border-green-600 text-lg items-center flex p-2 active:bg-green-600 justify-center gap-1"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Lock />}
          Login
        </button>
      </form>
    </div>
  );
}
