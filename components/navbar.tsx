"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import default_avatar from "@/../../public/default_avatar.png";

interface User {
  email: string;
  avatar_url?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // State to store role
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const email = session.user.email || "";

        // Fetch user role from the 'profiles' table
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", email)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
        } else {
          setRole(profile.role); // Store user role
        }

        setUser({
          email,
          avatar_url: session.user.user_metadata.avatar_url || "",
        });
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <div className="bg-black text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">
          <h1>Logo</h1>
        </Link>
      </div>
      <div className="flex space-x-6 items-center">
        <Link href="/posts">
          <h1 className="hover:underline">Innlegg</h1>
        </Link>
        <Link href="/nyheter">
          <h1 className="hover:underline">Nyheter</h1>
        </Link>
        <Link href="/prosjekter">
          <h1 className="hover:underline">Prosjekter</h1>
        </Link>

        {/* Show "Admin Panel" only if user is an admin */}
        {role === "admin" && (
          <Link href="/admin">
            <h1 className="hover:underline text-red-500">Admin Panel</h1>
          </Link>
        )}

        {user ? (
          <div className="relative">
            <Image
              src={user.avatar_url || default_avatar}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowLogout(!showLogout)}
            />
            {showLogout && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <h1 className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300">
              Login
            </h1>
          </Link>
        )}
      </div>
    </div>
  );
}
