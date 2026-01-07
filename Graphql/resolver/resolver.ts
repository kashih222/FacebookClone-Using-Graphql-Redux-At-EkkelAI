import { User } from "../models/User";
import { Post } from "../models/Post";
import { FriendRequest } from "../models/FriendRequest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();


// Initialize S3 (add this near your other imports/initializations)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

function monthToIndex(m: string): number {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const i = months.indexOf(m);
  if (i === -1) throw new Error("Invalid month");
  return i;
}

function summarizeReactions(reactions: any[]) {
  const init = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  return reactions.reduce(
    (acc, r) => {
      const t = r.type as keyof typeof init;
      if (t in acc) acc[t]++;
      return acc;
    },
    { ...init }
  );
}

export const resolvers = {
  Query: {
    // logedin User Info
    me: async (_: unknown, __: unknown, ctx: any) => {
      try {
        const token = ctx.req?.cookies?.token;
        if (!token) return null;
        const secret = process.env.JWT_SECRET || "devsecret";
        const payload = jwt.verify(token, secret) as { uid: string };
        const user = await User.findById(payload.uid);
        if (!user) return null;
        return {
          id: user._id.toString(),
          firstName: user.firstName,
          surname: user.surname,
          email: user.email,
          dob: user.dob.toISOString(),
          gender: user.gender,
          createdAt: user.createdAt.toISOString(),
        };
      } catch {
        return null;
      }
    },

    // Fetch all posts
    posts: async () => {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("author")
        .populate("comments.author")
        .populate("reactions.user");
      return posts.map((post: any) => ({
        id: post._id.toString(),
        content: post.content,
        imageUrl: post.imageUrl,
        imageUrls: post.imageUrls || [],
        author: {
          id: post.author._id.toString(),
          firstName: post.author.firstName,
          surname: post.author.surname,
          email: post.author.email,
          dob: post.author.dob.toISOString(),
          gender: post.author.gender,
          createdAt: post.author.createdAt.toISOString(),
        },
        createdAt: post.createdAt.toISOString(),
        comments: (post.comments || []).map((c: any) => ({
          id: c._id.toString(),
          content: c.content,
          author: {
            id: c.author._id.toString(),
            firstName: c.author.firstName,
            surname: c.author.surname,
            email: c.author.email,
            dob: c.author.dob.toISOString(),
            gender: c.author.gender,
            createdAt: c.author.createdAt.toISOString(),
          },
          createdAt: c.createdAt.toISOString(),
        })),
        reactions: (post.reactions || []).map((r: any) => ({
          user: {
            id: r.user._id.toString(),
            firstName: r.user.firstName,
            surname: r.user.surname,
            email: r.user.email,
            dob: r.user.dob.toISOString(),
            gender: r.user.gender,
            createdAt: r.user.createdAt.toISOString(),
          },
          type: r.type,
          createdAt: r.createdAt.toISOString(),
        })),
        reactionSummary: summarizeReactions(post.reactions || []),
      }));
    },

    // Fetch my posts
    myPosts: async (_: unknown, __: unknown, ctx: any) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const authorId = payload.uid;

      const posts = await Post.find({ author: authorId })
        .sort({ createdAt: -1 })
        .populate("author")
        .populate("comments.author")
        .populate("reactions.user");
      return posts.map((post: any) => ({
        id: post._id.toString(),
        content: post.content,
        imageUrl: post.imageUrl,
        imageUrls: post.imageUrls || [],
        author: {
          id: post.author._id.toString(),
          firstName: post.author.firstName,
          surname: post.author.surname,
          email: post.author.email,
        
          createdAt: post.author.createdAt.toISOString(),
        },
        createdAt: post.createdAt.toISOString(),
        comments: (post.comments || []).map((c: any) => ({
          id: c._id.toString(),
          author: {
            id: c.author._id.toString(),
            firstName: c.author.firstName,
            surname: c.author.surname,
            email: c.author.email,
         
            createdAt: c.author.createdAt.toISOString(),
          },
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
        reactions: (post.reactions || []).map((r: any) => ({
          user: {
            id: r.user._id.toString(),
            firstName: r.user.firstName,
            surname: r.user.surname,
            email: r.user.email,
          
            createdAt: r.user.createdAt.toISOString(),
          },
          type: r.type,
          createdAt: r.createdAt.toISOString(),
        })),
        reactionSummary: summarizeReactions(post.reactions || []),
      }));
    },

    // All users
    users: async () => {
      const users = await User.find().sort({ createdAt: -1 });
      return users.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        surname: u.surname,
        email: u.email,
    
        createdAt: u.createdAt.toISOString(),
      }));
    },

    // My friends
    myFriends: async (_: unknown, __: unknown, ctx: any) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const me = await User.findById(payload.uid).populate("friends");
      if (!me) throw new Error("User not found");
      const friends = (me.friends as any[]) || [];
      return friends.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        surname: u.surname,
        email: u.email,
     
        createdAt: u.createdAt.toISOString(),
      }));
    },

    // Friend suggestions
    friendSuggestions: async (_: unknown, __: unknown, ctx: any) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const me = await User.findById(payload.uid);
      if (!me) throw new Error("User not found");

      // Get pending requests to exclude users who already sent requests
      const pendingRequests = await FriendRequest.find({
        $or: [
          { from: payload.uid, status: "pending" },
          { to: payload.uid, status: "pending" },
        ],
      });
      const requestUserIds = new Set<string>();
      pendingRequests.forEach((req) => {
        requestUserIds.add(req.from.toString());
        requestUserIds.add(req.to.toString());
      });

      const excludeIds = new Set<string>([
        payload.uid,
        ...me.friends.map((f) => f.toString()),
        ...Array.from(requestUserIds),
      ]);
      const users = await User.find({ _id: { $nin: Array.from(excludeIds) } });
      // Shuffle
      for (let i = users.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [users[i], users[j]] = [users[j], users[i]];
      }
      return users.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        surname: u.surname,
        email: u.email,
     
        createdAt: u.createdAt.toISOString(),
      }));
    },

    // Get friend requests (incoming)
    friendRequests: async (_: unknown, __: unknown, ctx: any) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };

      const requests = await FriendRequest.find({
        to: payload.uid,
        status: "pending",
      })
        .populate("from")
        .sort({ createdAt: -1 });

      return requests.map((req: any) => ({
        id: req._id.toString(),
        from: {
          id: req.from._id.toString(),
          firstName: req.from.firstName,
          surname: req.from.surname,
          email: req.from.email,
        
          createdAt: req.from.createdAt.toISOString(),
        },
        to: {
          id: payload.uid,
          firstName: "",
          surname: "",
          email: "",
          dob: "",
          gender: "",
          createdAt: "",
        },
        status: req.status,
        createdAt: req.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    // SignUp USer
    signup: async (
      _: unknown,
      args: {
        input: {
          firstName: string;
          surname: string;
          email: string;
          password: string;
          day: number;
          month: string;
          year: number;
          gender: string;
        };
      }
    ) => {
      const { firstName, surname, email, password, day, month, year, gender } =
        args.input;
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        throw new Error("Email already in use");
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const dob = new Date(year, monthToIndex(month), day);
      const created = await User.create({
        firstName,
        surname,
        email,
        passwordHash,
        dob,
        gender,
      });
      return {
        id: created._id.toString(),
        firstName: created.firstName,
        surname: created.surname,
        email: created.email,
        dob: created.dob.toISOString(),
        gender: created.gender,
        createdAt: created.createdAt.toISOString(),
      };
    },

    //Login User
    login: async (
      _: unknown,
      args: { email: string; password: string },
      ctx: any
    ) => {
      const { email, password } = args;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        throw new Error("Invalid credentials");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const token = jwt.sign({ uid: user._id.toString() }, secret, {
        expiresIn: "7d",
      });
      if (ctx.res) {
        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
      }
      return {
        token,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          surname: user.surname,
          email: user.email,
        
          createdAt: user.createdAt.toISOString(),
        },
      };
    },
    // LogOut USer
    logout: async (_: unknown, __: unknown, ctx: any) => {
      if (ctx.res) {
        ctx.res.clearCookie("token", {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
        });
      }
      return true;
    },

    // Create post
    createPost: async (
      _: unknown,
      args: {
        input: { content: string; imageUrl?: string; imageUrls?: string[] };
      },
      ctx: any
    ) => {
      console.log("heloooooooooooooooooooooooo");
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const authorId = payload.uid;
      const created = await Post.create({
        content: args.input.content,
        imageUrl: args.input.imageUrl || null,
        imageUrls: args.input.imageUrls || [],
        author: authorId,
      });
      const user = await User.findById(authorId);
      if (!user) {
        throw new Error("User not found");
      }
      return {
        id: created._id.toString(),
        content: created.content,
        imageUrl: created.imageUrl || null,
        imageUrls: created.imageUrls || [],
        author: {
          id: user._id.toString(),
          firstName: user.firstName,
          surname: user.surname,
          email: user.email,
          dob: user.dob.toISOString(),
          gender: user.gender,
          createdAt: user.createdAt.toISOString(),
        },
        createdAt: created.createdAt.toISOString(),
        comments: [],
        reactions: [],
        reactionSummary: summarizeReactions([]),
      };
    },

    addComment: async (
      _: unknown,
      args: { input: { postId: string; content: string } },
      ctx: any
    ) => {
      console.log("hehhehehehe")
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const authorId = payload.uid;
      const postId = args.input.postId;
      const rawContent = args.input.content;
      const content = typeof rawContent === "string" ? rawContent.trim() : "";

      if (!content) {
        throw new Error("Comment content is required");
      }

      if (content === postId) {
        throw new Error("Invalid comment content");
      }
      if (content === authorId) {
        throw new Error("Invalid comment content");
      }
      if (/^[a-f0-9]{24}$/i.test(content)) {
        throw new Error("Invalid comment content");
      }

      const post = await Post.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      console.log("args",args)

      post.comments.push({
        author: authorId,
        content,
        createdAt: new Date(),
      } as any);
      await post.save();
      const populated = await Post.findById(post._id)
        .populate("author")
        .populate("comments.author")
        .populate("reactions.user");
      const p: any = populated;
      return {
        id: p._id.toString(),
        content: p.content,
        imageUrl: p.imageUrl,
        imageUrls: p.imageUrls || [],
        author: {
          id: p.author._id.toString(),
          firstName: p.author.firstName,
          surname: p.author.surname,
          email: p.author.email,
          dob: p.author.dob.toISOString(),
          gender: p.author.gender,
          createdAt: p.author.createdAt.toISOString(),
        },
        createdAt: p.createdAt.toISOString(),
        comments: (p.comments || []).map((c: any) => ({
          id: c._id.toString(),
          author: {
            id: c.author._id.toString(),
            firstName: c.author.firstName,
            surname: c.author.surname,
            email: c.author.email,
            dob: c.author.dob.toISOString(),
            gender: c.author.gender,
            createdAt: c.author.createdAt.toISOString(),
          },
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
        reactions: (p.reactions || []).map((r: any) => ({
          user: {
            id: r.user._id.toString(),
            firstName: r.user.firstName,
            surname: r.user.surname,
            email: r.user.email,
            dob: r.user.dob.toISOString(),
            gender: r.user.gender,
            createdAt: r.user.createdAt.toISOString(),
          },
          type: r.type,
          createdAt: r.createdAt.toISOString(),
        })),
        reactionSummary: summarizeReactions(p.reactions || []),
      };
    },


    reactPost: async (
      _: unknown,
      args: { input: { postId: string; type: string } },
      ctx: any
    ) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const userId = payload.uid;
      const post = await Post.findById(args.input.postId);
      if (!post) {
        throw new Error("Post not found");
      }
      const existingIndex = (post.reactions || []).findIndex(
        (r: any) => r.user.toString() === userId
      );
      if (existingIndex !== -1) {
        const existing = (post.reactions as any[])[existingIndex];
        if (existing.type === args.input.type) {
          (post.reactions as any[]).splice(existingIndex, 1);
        } else {
          existing.type = args.input.type;
          existing.createdAt = new Date();
        }
      } else {
        post.reactions.push({
          user: userId,
          type: args.input.type,
          createdAt: new Date(),
        } as any);
      }
      await post.save();
      const populated = await Post.findById(post._id)
        .populate("author")
        .populate("comments.author")
        .populate("reactions.user");
      const p: any = populated;
      return {
        id: p._id.toString(),
        content: p.content,
        imageUrl: p.imageUrl,
        imageUrls: p.imageUrls || [],
        author: {
          id: p.author._id.toString(),
          firstName: p.author.firstName,
          surname: p.author.surname,
          email: p.author.email,
          dob: p.author.dob.toISOString(),
          gender: p.author.gender,
          createdAt: p.author.createdAt.toISOString(),
        },
        createdAt: p.createdAt.toISOString(),
        comments: (p.comments || []).map((c: any) => ({
          id: c._id.toString(),
          author: {
            id: c.author._id.toString(),
            firstName: c.author.firstName,
            surname: c.author.surname,
            email: c.author.email,
            dob: c.author.dob.toISOString(),
            gender: c.author.gender,
            createdAt: c.author.createdAt.toISOString(),
          },
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
        reactions: (p.reactions || []).map((r: any) => ({
          user: {
            id: r.user._id.toString(),
            firstName: r.user.firstName,
            surname: r.user.surname,
            email: r.user.email,
            dob: r.user.dob.toISOString(),
            gender: r.user.gender,
            createdAt: r.user.createdAt.toISOString(),
          },
          type: r.type,
          createdAt: r.createdAt.toISOString(),
        })),
        reactionSummary: summarizeReactions(p.reactions || []),
      };
    },

    // Add friend
    addFriend: async (_: unknown, args: { userId: string }, ctx: any) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const meId = payload.uid;
      if (args.userId === meId) {
        throw new Error("Cannot add yourself");
      }
      const exists = await User.findById(args.userId);
      if (!exists) {
        throw new Error("User not found");
      }
      await User.updateOne(
        { _id: meId },
        { $addToSet: { friends: args.userId } }
      );
      await User.updateOne(
        { _id: args.userId },
        { $addToSet: { friends: meId } }
      );
      return true;
    },

    // Send friend request
    sendFriendRequest: async (
      _: unknown,
      args: { userId: string },
      ctx: any
    ) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const meId = payload.uid;

      if (args.userId === meId) {
        throw new Error("Cannot send request to yourself");
      }

      const targetUser = await User.findById(args.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      const me = await User.findById(meId);
      if (me && me.friends.some((f) => f.toString() === args.userId)) {
        throw new Error("Already friends");
      }

      const existingRequest = await FriendRequest.findOne({
        $or: [
          { from: meId, to: args.userId },
          { from: args.userId, to: meId },
        ],
        status: "pending",
      });

      if (existingRequest) {
        throw new Error("Friend request already exists");
      }
      await FriendRequest.create({
        from: meId,
        to: args.userId,
        status: "pending",
      });

      return true;
    },

    // Accept friend request
    acceptFriendRequest: async (
      _: unknown,
      args: { requestId: string },
      ctx: any
    ) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const meId = payload.uid;

      const request = await FriendRequest.findById(args.requestId);
      if (!request) {
        throw new Error("Friend request not found");
      }

      if (request.to.toString() !== meId) {
        throw new Error("You can only accept requests sent to you");
      }

      if (request.status !== "pending") {
        throw new Error("Request already processed");
      }

      request.status = "accepted";
      await request.save();

      await User.updateOne(
        { _id: request.from },
        { $addToSet: { friends: request.to } }
      );
      await User.updateOne(
        { _id: request.to },
        { $addToSet: { friends: request.from } }
      );

      return true;
    },

    // Reject friend request
    rejectFriendRequest: async (
      _: unknown,
      args: { requestId: string },
      ctx: any
    ) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const meId = payload.uid;

      const request = await FriendRequest.findById(args.requestId);
      if (!request) {
        throw new Error("Friend request not found");
      }

      if (request.to.toString() !== meId) {
        throw new Error("You can only reject requests sent to you");
      }

      request.status = "rejected";
      await request.save();

      return true;
    },

    getUploadTargets: async (
      _: unknown,
      args: { requests: Array<{ filename: string; contentType: string }> },
      ctx: { req?: { cookies?: { token?: string } } }
    ) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      const payload = jwt.verify(token, secret) as { uid: string };
      const bucket = process.env.AWS_BUCKET_NAME;
      const region = process.env.AWS_REGION;
      const now = Date.now();
      const results: Array<{ uploadUrl: string; publicUrl: string; fields: Array<{ key: string; value: string }> }> = [];
      for (let idx = 0; idx < args.requests.length; idx++) {
        const req = args.requests[idx];
        const safeName = req.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `posts/${payload.uid}/${now}-${idx}-${safeName}`;
        // Generate presigned PUT URL for direct upload
        const uploadUrl = await new Promise<string>((resolve, reject) => {
          (s3 as any).getSignedUrl(
            "putObject",
            {
              Bucket: bucket,
              Key: key,
              ContentType: req.contentType,
              Expires: 300,
            },
            (err: any, url: string) => (err ? reject(err) : resolve(url))
          );
        });
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        const fieldsArr: Array<{ key: string; value: string }> = [];
        results.push({ uploadUrl, publicUrl, fields: fieldsArr });
      }
      return results;
    }
    ,


    getViewUrls: async (
      _: unknown,
      args: { urls: string[] },
      ctx: { req?: { cookies?: { token?: string } } }
    ) => {
      const token = ctx.req?.cookies?.token;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const secret = process.env.JWT_SECRET || "devsecret";
      jwt.verify(token, secret);
      const bucket = process.env.AWS_BUCKET_NAME || "gp-bucket-001";
      const signed: string[] = [];
      for (const url of args.urls) {
        try {
          const u = new URL(url);
          const key = u.pathname.replace(/^\/+/, "");
          const signedUrl = await new Promise<string>((resolve, reject) => {
            (s3 as any).getSignedUrl(
              "getObject",
              {
                Bucket: bucket,
                Key: key,
                Expires: 300,
              },
              (err: any, surl: string) => (err ? reject(err) : resolve(surl))
            );
          });
          signed.push(signedUrl);
        } catch {
          signed.push(url);
        }
      }
      return signed;
    }
  },
};
