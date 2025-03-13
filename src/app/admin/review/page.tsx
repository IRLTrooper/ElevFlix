"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Post {
  id: string;
  title: string;
  description: string;
  mainContent: string;
  content?: string;
  contentType?: string;
  is_public: boolean;
}

export default function AdminPostReview() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = searchParams.get("id"); // ✅ Get ID from URL query

  useEffect(() => {
    if (!id) {
      console.error("No ID provided in search params");
      router.push("/admin");
      return;
    }

    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)  // ✅ Fetch by ID
        .eq("is_public", false)
        .single();

      if (error) console.error("Error fetching post:", error);
      else setPost(data);

      setLoading(false);
    }

    fetchPost();
  }, [id]);

  async function handleApprove() {
    await supabase.from("posts").update({ is_public: true }).eq("id", id);
    router.push("/admin");
  }

  async function handleDecline() {
    if (!post) return;

    try {
      // ✅ Extract the filename from the full URL
      if (post.content) {
        const urlParts = post.content.split("/");
        const fileName = urlParts[urlParts.length - 1]; // Extracts the filename (e.g., "image.png")

        const { error: storageError } = await supabase.storage
          .from("public")
          .remove([fileName]); // ✅ Delete image from storage

        if (storageError) {
          console.error("Error deleting image:", storageError.message);
        } else {
          console.log("Image deleted successfully:", fileName);
        }
      }

      // ✅ Delete the post from database
      const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);
      if (deleteError) throw deleteError;

      console.log("Post deleted successfully");
      router.push("/admin");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="mt-4">{post.description}</p>
      
      {post.content && post.contentType?.startsWith("image") && (
        <img src={post.content} alt={post.title} className="mt-2 max-w-full" />
      )}

      {post.content && post.contentType?.startsWith("video") && (
        <video controls className="mt-2 max-w-full">
          <source src={post.content} type={post.contentType} />
        </video>
      )}

      <div className="mt-4">{post.mainContent}</div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleApprove}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Approve
        </button>
        <button
          onClick={handleDecline}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
