import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const mainContent = formData.get('mainContent') as string;
    const user_email = formData.get('user_email') as string;
    const content = formData.get('content') as File | null;

    if (!title || !description || !mainContent || !user_email) {
      return NextResponse.json(
        { message: 'Title, description, main content, and user email are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, description, mainContent, user_email, content }]);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: 'Post created successfully!', data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Error creating post', error: error.message || error },
      { status: 500 }
    );
  }
}
