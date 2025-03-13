"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Post = {
  id: string;
  email: string;
  title: string;
  description: string;
  mainContent: string;
  content?: string;
  contentType?: string;
  is_public: boolean;
};

export default function PostDetails() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updatedPost, setUpdatedPost] = useState<Post | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        return;
      }

      setPost(data);
      setUpdatedPost(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === data.email) {
        setIsOwner(true);
      }
    }

    fetchPost();
  }, [id]);

  const handleEditToggle = () => setEditing(!editing);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!updatedPost) return;
    setUpdatedPost({ ...updatedPost, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!updatedPost) return;

    let newImageUrl = updatedPost.content; // Default to existing image

    if (newImage) {
      const fileExt = newImage.name.split(".").pop();
      const filePath = `public/${updatedPost.id}.${fileExt}`;

      try {
        // ✅ Delete old image (only if there's an existing image)
        if (updatedPost.content) {
          const oldFileName = updatedPost.content.split("/public/")[1]; // Extract filename
          const { error: deleteError } = await supabase.storage
            .from("uploads")
            .remove([`public/${oldFileName}`]);

          if (deleteError) {
            console.error("❌ Error deleting old image:", deleteError.message);
          } else {
            console.log("✅ Old image deleted successfully.");
          }
        }

        // ✅ Upload the new image
        const { data, error } = await supabase.storage
          .from("uploads")
          .upload(filePath, newImage, { upsert: true }); // Use `upsert: true` to replace existing file

        if (error) {
          console.error("❌ Error uploading new image:", error.message);
          return;
        }

        // ✅ Generate correct public URL
        newImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`;
        console.log("✅ New image uploaded at:", newImageUrl);
      } catch (err) {
        if (err instanceof Error) {
          console.error("❌ Upload process failed:", err.message);
        } else {
          console.error("❌ Upload process failed:", err);
        }
        return;
      }
    }

    // ✅ Update post with new image URL
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: updatedPost.title,
        description: updatedPost.description,
        mainContent: updatedPost.mainContent,
        content: newImageUrl, // ✅ Store the new image URL
      })
      .eq("id", updatedPost.id);

    if (updateError) {
      console.error("❌ Error updating post:", updateError.message);
    } else {
      console.log("✅ Post updated successfully!");
      setPost({ ...updatedPost, content: newImageUrl });
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    if (post.content) {
      const fileName = post.content.split("/public/")[1];
      if (fileName) {
        await supabase.storage.from("uploads").remove([`public/${fileName}`]);
      }
    }

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (error) {
      console.error("Error deleting post:", error.message);
    } else {
      router.push("/");
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {editing ? (
        <div>
          <input
            name="title"
            value={updatedPost?.title || ""}
            onChange={handleChange}
            className="block w-full p-2 text-black"
          />
          <textarea
            name="description"
            value={updatedPost?.description || ""}
            onChange={handleChange}
            className="block w-full p-2 text-black mt-2"
          />
          <textarea
            name="mainContent"
            value={updatedPost?.mainContent || ""}
            onChange={handleChange}
            className="block w-full p-2 text-black mt-2"
          />

          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4" />

          {previewImage && <img src={previewImage} alt="Preview" className="mt-2 max-w-full max-h-64 object-contain" />}

          <button onClick={handleSave} className="bg-blue-500 px-4 py-2 rounded text-white mt-4">
            Save
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="mt-4">{post.description}</p>

          {post.content && post.contentType?.startsWith("image") && (
            <img src={`${post.content}?t=${new Date().getTime()}`} alt={post.title} className="mt-2 max-w-full max-h-64 object-contain" />
          )}

          <div className="mt-4">{post.mainContent}</div>
        </div>
      )}

      {isOwner && (
        <div className="mt-6 flex space-x-4">
          <button onClick={handleEditToggle} className="bg-yellow-500 px-4 py-2 rounded text-white">
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className="bg-red-500 px-4 py-2 rounded text-white">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
