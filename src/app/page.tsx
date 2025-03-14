"use client";

import '@/app/globals.css';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Post = {
  id: string;
  title: string;
  description: string;
  content?: string;
  contentType?: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*');

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data);
      }
    }
    fetchPosts();
  }, []);

  const handlePostClick = (title: string, id: string) => {
    router.push(`/posts/${encodeURIComponent(title)}?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Latest Posts</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 border border-gray-600 rounded h-48 cursor-pointer flex space-y-2"
            onClick={() => handlePostClick(post.title, post.id)}
          >
            <div className="flex-1 flex flex-col justify-start">
              <h2 className="text-xl">{post.title}</h2>
              <p className='overflow-hidden'>{post.description}</p>
            </div>
            {post.content && post.contentType?.startsWith("image") && (
              <div className="flex h-full">
                <img src={`${post.content}?t=${new Date().getTime()}`} alt={post.title} className="max-w-full max-h-full rounded-2xl" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
