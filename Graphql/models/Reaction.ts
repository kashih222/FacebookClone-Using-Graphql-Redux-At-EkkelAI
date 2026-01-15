import mongoose, { Schema, model } from "mongoose";

const reactionSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["like", "love", "haha", "wow", "sad", "angry"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Create compound index to ensure one reaction per user per post
reactionSchema.index({ post: 1, user: 1 }, { unique: true });

export const Reaction = mongoose.models.Reaction || model("Reaction", reactionSchema);
