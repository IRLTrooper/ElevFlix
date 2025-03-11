import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(req: { formData: () => any; }) {
  try {
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

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, description, content }]);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Post created successfully!", data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Error creating post", error: error.message || error },
      { status: 500 }
    );
  }
}
