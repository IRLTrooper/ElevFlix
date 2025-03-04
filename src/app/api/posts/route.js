import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Post from "../../models/Post"; 

export async function POST(req) {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI);

  
    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const content = formData.get("content");

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

   
    const newPost = new Post({ title, description, content });
    await newPost.save();

    return NextResponse.json(
      { message: "Post created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Error creating post", error: error.message || error },
      { status: 500 }
    );
  }
}
