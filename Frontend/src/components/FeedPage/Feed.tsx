import { useEffect, useState, useCallback } from "react";
import Post from "../CreatePostPage/PostPage/Post";
import { GET_ALL_POSTS_QUERY } from "../../GraphqlOprations/queries";
import {
  REACT_POST_MUTATION,
} from "../../GraphqlOprations/mutations";
import { GET_VIEW_URLS_MUTATION } from "../../GraphqlOprations/mutations";

interface FeedProps {
  refreshTrigger?: number;
}

interface GPost {
  id: string;
  content: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  author: { id: string; firstName: string; surname: string; email: string };
  createdAt: string;
  comments: {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; firstName: string; surname: string; email: string };
  }[];
  reactions: {
    type: string;
    createdAt: string;
    user: { id: string };
  }[];
}

interface UIPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    time: string;
    verified: boolean;
  };
  content: string;
  images: string[];
  likes: number;
  comments: {
    id: string;
    authorName: string;
    text: string;
    createdAt: string;
  }[];
  shares: number;
  liked: boolean;
}

const Feed = ({ refreshTrigger = 0 }: FeedProps) => {
  const [allPosts, setAllPosts] = useState<UIPost[]>([]);
  const [loading, setLoading] = useState(true);

  const sanitizeUrl = (url?: string | null): string | null => {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    const withoutTicks = trimmed.replace(/^`|`$/g, "");
    const withoutQuotes = withoutTicks.replace(/^"|"$|^'|'$/g, "");
    return withoutQuotes;
  };

  const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return "Recently";
    }

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "Recently";
      }

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();

      if (diffInMs < 0) {
        return "Just now";
      }

      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;

      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) return `${diffInMonths}mo ago`;

      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears}y ago`;
    } catch (error) {
      console.error(
        "Error formatting date:",
        error,
        "Date string:",
        dateString
      );
      return "Recently";
    }
  };

  const getUserInitials = (firstName: string, surname: string): string => {
    const first = firstName?.[0] || "";
    const last = surname?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const checkIfLikedByCurrentUser = (
    _reactions: { type: string; createdAt: string; user: { id: string } }[]
  ): boolean => {
    return false;
    console.log(_reactions)
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: GET_ALL_POSTS_QUERY }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.errors && json.errors.length) {
        console.error("Error loading posts:", json.errors[0].message);
        setAllPosts([]);
        return;
      }

      const list = (json.data?.posts || []) as GPost[];

      const mapped: UIPost[] = list.map((p) => {
        const likeReactions =
          p.reactions?.filter((r) => r.type === "like") || [];
        const shareReactions =
          p.reactions?.filter((r) => r.type === "share") || [];

        const primary = sanitizeUrl(p.imageUrl);
        const gallery = (p.imageUrls || [])
          .map((u) => sanitizeUrl(u))
          .filter((u): u is string => !!u);
        const images = [
          ...(primary ? [primary] : []),
          ...gallery.filter((u) => u !== primary),
        ];

        return {
          id: p.id,
          user: {
            name: `${p.author.firstName} ${p.author.surname}`,
            avatar: getUserInitials(p.author.firstName, p.author.surname),
            time: formatTimeAgo(p.createdAt),
            verified: true,
          },
          content: p.content,
          images,
          likes: likeReactions.length,
          comments: (p.comments || []).map((c) => ({
            id: c.id,
            authorName: `${c.author.firstName} ${c.author.surname}`,
            text: (c.content || "").trim(),
            createdAt: formatTimeAgo(c.createdAt),
          })),
          shares: shareReactions.length,
          liked: checkIfLikedByCurrentUser(p.reactions),
        };
      });

      // Sort posts by creation date (newest first)
      mapped.sort((a, b) => {
        const postA = list.find((p) => p.id === a.id);
        const postB = list.find((p) => p.id === b.id);

        if (!postA || !postB) return 0;

        const dateA = new Date(postA.createdAt).getTime();
        const dateB = new Date(postB.createdAt).getTime();

        return dateB - dateA; // Newest first
      });

      const allUrls = Array.from(
        new Set(
          mapped.flatMap((p) => p.images).filter((u) => typeof u === "string")
        )
      );
      let urlMap: Record<string, string> = {};
      if (allUrls.length > 0) {
        const signRes = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: GET_VIEW_URLS_MUTATION,
            variables: { urls: allUrls },
          }),
        });
        const signJson = await signRes.json();
        if (!signJson.errors && signJson.data?.getViewUrls) {
          const signed: string[] = signJson.data.getViewUrls;
          urlMap = Object.fromEntries(allUrls.map((u, i) => [u, signed[i]]));
        }
      }
      const replaced = mapped.map((p) => ({
        ...p,
        images: p.images.map((u) => urlMap[u] || u),
      }));
      setAllPosts(replaced);
    } catch (error) {
      console.error("Failed to load posts:", error);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger, loadPosts]);

  const handleLike = async (postId: string) => {
    try {
      const uiPost = allPosts.find((p) => p.id === postId);
      if (!uiPost) return;

      // Optimistic update
      setAllPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
                liked: !post.liked,
              }
            : post
        )
      );

      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: REACT_POST_MUTATION,
          variables: { input: { postId: uiPost.id, type: "like" } },
        }),
      });

      const json = await res.json();

      if (json.errors && json.errors.length) {
        console.error("Error liking post:", json.errors[0].message);
        // Revert optimistic update on error
        setAllPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.liked ? post.likes + 1 : post.likes - 1,
                  liked: !post.liked,
                }
              : post
          )
        );
        return;
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert optimistic update on error
      setAllPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.liked ? post.likes + 1 : post.likes - 1,
                liked: !post.liked,
              }
            : post
        )
      );
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

 

  return (
    <div className="space-y-6">
      {allPosts.map((post) => (
        <Post
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
        />
      ))}
    </div>
  );
};

export default Feed;
