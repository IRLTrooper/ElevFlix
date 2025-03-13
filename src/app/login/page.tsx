"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already logged in:", session.user);
        window.location.href = "/";
      }
    };
    checkSession();
  }, []);

  const handleAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      let { data, error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      const user = data.user;
      if (user && isSignUp) {
        // Insert user profile into `profiles` table
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ user_id: user.id, email: user.email, role: "user" }]);

        if (insertError) console.error("Profile insert error:", insertError.message);
        else console.log("Profile created successfully!");
      }

      console.log("Authentication successful!", user);
      window.location.href = "/";
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-6">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border text-black border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border text-black border-gray-300 rounded"
        />
        <button
          onClick={handleAuth}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-blue-500 p-2 rounded cursor-pointer"
        >
          {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
        </button>
      </div>
    </div>
  );
}
