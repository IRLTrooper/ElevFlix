"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ✅ Define Post Type
interface Post {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/"); // Redirect if not logged in
        return;
      }

      // ✅ Check if user exists in the "profiles" table as an admin
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        router.push("/"); // Redirect if not an admin
        return;
      }

      setIsAdmin(true);
      fetchPosts();
    }

    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_public", false);

      if (error) console.error("Error fetching posts:", error.message);
      else setPosts(data as Post[]);
    }

    checkAdmin();
  }, [router]);

  const handleApprove = async (id: string) => {
    await supabase.from("posts").update({ is_public: true }).eq("id", id);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

// ✅ Admin Declines Post - Delete post & image
const handleDecline = async (id: string, imageUrl?: string) => {
    // ✅ If there's an image, delete it first
    if (imageUrl) {
      const filePath = imageUrl.split("/public/")[1]; // Extract filename
      await supabase.storage.from("public").remove([`public/${filePath}`]); // ✅ Delete image
    }
  
    // ✅ Delete the post itself
    await supabase.from("posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };
  

  const handlePostClick = (id: string) => {
    router.push(`/admin/review?id=${id}`);
  };
  

  return isAdmin ? (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {posts.map((post) => (
        <div 
        key={post.id} 
        className="p-4 border border-gray-600 rounded my-4"
        onClick={() => handlePostClick(post.id)}

        >
        <h2 className="text-xl">{post.title}</h2>
          <p>{post.description}</p>
          <button
            onClick={() => handleApprove(post.id)}
            className="bg-green-500 text-white px-4 py-2 rounded mx-2"
          >
            Approve
          </button>
          <button
            onClick={() => handleDecline(post.id)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Decline
          </button>
        </div>
      ))}
    </div>
  ) : null;
}
