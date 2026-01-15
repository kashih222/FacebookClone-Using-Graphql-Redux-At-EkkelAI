import mongoose, { Schema, model } from "mongoose";

const postSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Post = mongoose.models.Post || model("Post", postSchema);
