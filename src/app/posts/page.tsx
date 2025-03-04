"use client"

import { useState } from 'react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(null);

  const handleFileChange = (e) => {
    setContent(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (content) formData.append('content', content);
    
    const res = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
    });
    
    if (res.ok) {
      alert('Post added successfully!');
      setTitle('');
      setDescription('');
      setContent(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
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
        <input 
          type="file" 
          accept="image/*,video/*" 
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded" 
          onChange={handleFileChange}
        />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300">
          Submit Post
        </button>
      </form>
    </div>
  );
}
