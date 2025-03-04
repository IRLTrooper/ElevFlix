"use client"

import { useEffect, useState } from 'react';

type Post = {
  _id: string;
  title: string;
  description: string;
  content?: string;
  contentType?: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);


  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch('/api/posts');
      const data: Post[] = await res.json();
      setPosts(data);
    }
    fetchPosts();
  }, []);
  

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Latest Posts</h1>
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="p-4 border border-gray-600 rounded">
            <h2 className="text-xl">{post.title}</h2>
            <p>{post.description}</p>
            {post.contentType?.startsWith('image') && (
              <img src={`data:${post.contentType};base64,${post.content}`} alt={post.title} className="mt-2 max-w-full" />
            )}
            {post.contentType?.startsWith('video') && (
              <video controls className="mt-2 max-w-full">
                <source src={`data:${post.contentType};base64,${post.content}`} type={post.contentType} />
              </video>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
