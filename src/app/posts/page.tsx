"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainContent, setMainContent] = useState("");
  const [content, setContent] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getSession();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setContent(e.target.files[0]);
    } else {
      setContent(null);
    }
  };

  const handleMainContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.split(/\s+/);
    if (words.length > 1500) {
      setError("Main content cannot exceed 1500 words.");
    } else {
      setError(null);
      setMainContent(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) return;
    if (!userEmail) {
      alert("You must be logged in to create a post.");
      return;
    }

    setUploading(true);
    let contentUrl = null;

    if (content) {
      console.log("Uploading file:", content.name);
      const { data, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(`public/${Date.now()}-${content.name}`, content, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("File upload failed. Check Supabase Storage settings.");
        setUploading(false);
        return;
      }

      console.log("File uploaded:", data);
      contentUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`;
    }

    console.log("Saving post with content URL:", contentUrl);

    const { error: dbError } = await supabase.from("posts").insert({
      title,
      description,
      mainContent,
      content: contentUrl,
      contentType: content ? content.type : null,
      is_public: false, // ✅ Always set to false
      email: userEmail, // ✅ Save the user's email
    });

    setUploading(false);

    if (dbError) {
      console.error("Database error:", dbError);
      alert("Database insert failed.");
    } else {
      alert("Post added successfully! Awaiting admin approval.");
      setTitle("");
      setDescription("");
      setMainContent("");
      setContent(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Lag et Innlegg</h1>
      <form className="w-full max-w-lg flex flex-col space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <textarea
          placeholder="Main Content (max 1500 words)"
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded"
          value={mainContent}
          onChange={handleMainContentChange}
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        <input
          type="file"
          accept="image/*,video/*"
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          {uploading ? "Uploading..." : "Submit Post"}
        </button>
      </form>
    </div>
  );
}
