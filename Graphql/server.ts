import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { json as expressJson } from "express";
import cookieParser from "cookie-parser";
import { typeDefs } from "./schema/typesdef";
import { resolvers } from "./resolver/resolver";

dotenv.config();

const resolverss = resolvers;

console.log("Resolvers", resolverss.Mutation.addComment)

const app = express();
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "https://studio.apollographql.com",
    "https://sandbox.embed.apollographql.com",
  ]
).map((o) => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(expressJson());
app.use(cookieParser());

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

async function start() {
  try {
    console.log("Starting GraphQL server...");
    await server.start();

    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req, res }) => ({ req, res }),
      })
    );

    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB connected successfully");
      } catch (error: any) {
        console.error("❌ MongoDB connection failed:");

        throw error; // Re-throw to prevent server from starting without DB
      }
    } else {
      console.warn("⚠️  MONGO_URI not set; skipping DB connection");
    }

    const PORT = process.env.PORT || 4200;
    app
      .listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      })
      .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.error(`❌ Port ${PORT} is already in use.`);
        } else {
          console.error(`❌ Server error:`, err);
        }
        process.exit(1);
      });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
