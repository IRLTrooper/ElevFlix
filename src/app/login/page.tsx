"use client";

import '@app/globals.css';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'default_value';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async () => {
        setError(null);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                console.log('User signed up:', data.user);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                console.log('User signed in:', data.user);
            }
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl text-black font-bold mb-6">{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
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
                >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-blue-500 p-2 rounded cursor-pointer"
                >
                    {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                </button>
            </div>
        </div>
    );
}