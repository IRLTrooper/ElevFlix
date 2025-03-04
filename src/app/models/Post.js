import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String }, 
  contentType: { type: String }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
