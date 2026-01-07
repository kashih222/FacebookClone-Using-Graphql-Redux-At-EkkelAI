import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import Post from "../CreatePostPage/PostPage/Post";
import { GET_MY_POSTS_QUERY } from "../../GraphqlOprations/queries";
import { REACT_POST_MUTATION, GET_VIEW_URLS_MUTATION } from "../../GraphqlOprations/mutations";

// Update interfaces based on actual data structure
type AuthorLike = {
  id?: string;
  firstName?: string;
  surname?: string;
  name?: string;
} | string;

interface GPost {
  id: string;
  content?: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  author: AuthorLike;
  createdAt: string;
  comments?: {
    id: string;
    content: string;
    createdAt: string;
    author?: AuthorLike;
  }[];
  reactions?: {
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
    verified: boolean 
  };
  content: string;
  images: string[];
  likes: number;
  comments: { 
    id: string; 
    authorName: string; 
    text: string; 
    createdAt: string;
    authorAvatar: string;
  }[];
  shares: number;
  liked: boolean;
}

interface PersonalFeedHandle {
  refresh: () => void;
}

type PersonalFeedProps = Record<string, never>;

const PersonalFeed = forwardRef<PersonalFeedHandle, PersonalFeedProps>((_props, ref) => {
  const [allPosts, setAllPosts] = useState<UIPost[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  console.log("All posts:", allPosts); 
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
      
      // For older dates
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
      };
      
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
      }
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Error formatting date:", error, "Date string:", dateString);
      return "Recently";
    }
  };

  // Helper to get user initials for avatar - FIXED VERSION
  const getUserInitials = (author: AuthorLike | undefined): string => {
    if (!author) return 'U';
    
    if (typeof author === 'string') {
      const parts = author.split(' ');
      const first = parts[0]?.[0] || '';
      const last = parts[1]?.[0] || '';
      return `${first}${last}`.toUpperCase();
    }
    
    // Handle object author
    if (typeof author === 'object') {
      if (author.firstName && author.surname) {
        return `${author.firstName[0]}${author.surname[0]}`.toUpperCase();
      } else if (author.firstName) {
        return author.firstName[0].toUpperCase();
      } else if (author.name) {
        const parts = author.name.split(' ');
        const first = parts[0]?.[0] || '';
        const last = parts[1]?.[0] || '';
        return `${first}${last}`.toUpperCase();
      }
    }
    
    return 'U';
  };

  // Helper to get author name 
  const getAuthorName = (author: AuthorLike | undefined): string => {
    if (!author) return "Unknown User";
    
    if (typeof author === 'string') {
      return author;
    }
    
    if (typeof author === 'object') {
      if (author.firstName && author.surname) {
        return `${author.firstName} ${author.surname}`;
      } else if (author.firstName) {
        return author.firstName;
      } else if (author.name) {
        return author.name;
      }
    }
    
    return "Unknown User";
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: GET_MY_POSTS_QUERY }),
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
      
      const list = (json.data?.myPosts || []) as GPost[];
      
      // Debug: Log the raw data structure
      console.log("Full raw posts data:", JSON.stringify(list, null, 2));
      
      // Process posts
      const sanitizeUrl = (url?: string | null): string | null => {
        if (!url || typeof url !== 'string') return null;
        const trimmed = url.trim();
        const withoutTicks = trimmed.replace(/^`|`$/g, '');
        const withoutQuotes = withoutTicks.replace(/^"|"$|^'|'$/g, '');
        return withoutQuotes;
      };

      const mapped: UIPost[] = list.map((post) => {
        const authorName = getAuthorName(post.author);
        const authorInitials = getUserInitials(post.author);
        const postTime = formatTimeAgo(post.createdAt);
        
        const primary = sanitizeUrl(post.imageUrl);
        const gallery = (post.imageUrls || [])
          .map((u) => sanitizeUrl(u))
          .filter((u): u is string => !!u);
        const images = [
          ...(primary ? [primary] : []),
          ...gallery.filter((u) => u !== primary),
        ];
        console.log("Gallery:", gallery);

        return {
          id: post.id,
          user: {
            name: authorName,
            avatar: authorInitials,
            time: postTime,
            verified: true,
          },
          content: post.content || "No content",
          images,
          likes: post.reactions?.length || 0,
          comments: (post.comments || []).map((comment) => ({
            id: comment.id || Math.random().toString(),
            authorName: getAuthorName(comment.author ?? "Unknown User"),
            text: (comment.content || "").trim(),
            createdAt: formatTimeAgo(comment.createdAt),
            authorAvatar: getUserInitials(comment.author ?? "U"),
          })),
          shares: 0,
          liked: false,
        };
      });
      
      // Sort posts by creation date (newest first)
      mapped.sort((a, b) => {
        const postA = list.find(p => p.id === a.id);
        const postB = list.find(p => p.id === b.id);
        
        if (!postA || !postB) return 0;
        
        const dateA = new Date(postA.createdAt).getTime();
        const dateB = new Date(postB.createdAt).getTime();
        
        return dateB - dateA;
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

  

  useImperativeHandle(ref, () => ({
    refresh: () => {
      setRefreshTrigger(prev => prev + 1);
    }
  }), []);

  const handleLike = async (postId: string) => {
    try {
      const uiPost = allPosts.find(p => p.id === postId);
      if (!uiPost) return;
      
      // Optimistic update
      setAllPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked
            } 
          : post
      ));
      
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: REACT_POST_MUTATION,
          variables: { input: { postId: uiPost.id, type: "like" } }
        }),
      });
      
      const json = await res.json();
      
      if (json.errors && json.errors.length) {
        console.error("Error liking post:", json.errors[0].message);
        // Revert optimistic update on error
        setAllPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: post.liked ? post.likes + 1 : post.likes - 1,
                liked: !post.liked
              } 
            : post
        ));
        return;
      }
      
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert optimistic update on error
      setAllPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.liked ? post.likes + 1 : post.likes - 1,
              liked: !post.liked
            } 
          : post
      ));
    }
  };

  // const handleAddComment = async (postId: string, commentText: string) => {
  //   try {
  //     if (!commentText.trim()) return;
      
  //     const uiPost = allPosts.find(p => p.id === postId);
  //     if (!uiPost) return;
      
  //     const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         query: ADD_COMMENT_MUTATION,
  //         variables: { input: { postId: uiPost.id, content: commentText } }
  //       }),
  //     });
      
  //     const json = await res.json();
      
  //     if (json.errors && json.errors.length) {
  //       console.error("Error adding comment:", json.errors[0].message);
  //       return;
  //     }
      
  //     setRefreshTrigger(prev => prev + 1);
      
  //   } catch (error) {
  //     console.error("Failed to add comment:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Loading posts...</p>
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
});

PersonalFeed.displayName = "PersonalFeed";

export default PersonalFeed;
