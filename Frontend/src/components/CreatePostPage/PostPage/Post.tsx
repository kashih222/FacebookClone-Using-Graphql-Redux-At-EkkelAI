import React, { useEffect, useRef, useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Send, Smile, Image as ImageIcon, User, Globe } from 'lucide-react';
import { FaHeart, FaThumbsUp } from 'react-icons/fa';
import MediaItem from '../../MediaItems/MediaItems';
import { ADD_COMMENT_MUTATION } from '../../../GraphqlOprations/mutations';

interface PostProps {
  post: {
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
      createdAt: string 
    }[];
    shares: number;
    liked: boolean;
  };
  onLike: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({ post, onLike }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showReactions, setShowReactions] = useState(false);
  const [reaction, setReaction] = useState<ReactionType | null>(null);

  const reactionsRef = useRef<HTMLDivElement>(null);

  type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';


  const reactions: Array<{ type: ReactionType; icon: string; label: string; color: string }> = [
    { type: 'like', icon: '👍', label: 'Like', color: 'text-blue-600' },
    { type: 'love', icon: '❤️', label: 'Love', color: 'text-red-600' },
    { type: 'haha', icon: '😄', label: 'Haha', color: 'text-yellow-600' },
    { type: 'wow', icon: '😯', label: 'Wow', color: 'text-yellow-500' },
    { type: 'sad', icon: '😢', label: 'Sad', color: 'text-blue-500' },
    { type: 'angry', icon: '😠', label: 'Angry', color: 'text-red-700' },
  ];

  const formatRelativeTime = (timeString: string): string => {
    if (timeString.includes('ago') || timeString.includes('Just now') || timeString === 'Recently') {
      return timeString;
    }
    
    try {
      const date = new Date(timeString);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in Post component:', timeString);
        return 'Recently';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      
      if (diffInMs < 0) return 'Just now';
      
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInSeconds < 60) return 'Just now';
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
      console.error('Error formatting time in Post:', error);
      return 'Recently';
    }
  };

  const handleReaction = (reactionType: ReactionType) => {
    setReaction(reactionType);
    onLike(post.id);
    setShowReactions(false);
  };

  const handleLikeButtonClick = () => {
    if (reaction === 'like') {
      setReaction(null);
      onLike(post.id);
    } else {
      setReaction('like');
      onLike(post.id);
    }
  };

  const handleMouseEnter = () => {
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (reactionsRef.current && !reactionsRef.current.matches(':hover')) {
        setShowReactions(false);
      }
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddComment = async (postId: string, commentText: string) => {
    try {
      console.log("commentText", commentText);
      if (!commentText.trim()) return;

     
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: ADD_COMMENT_MUTATION,
          variables: { input: { postId, content: commentText } },
        }),
      });

      const json = await res.json();

      if (json.errors && json.errors.length) {
        console.error("Error adding comment:", json.errors[0].message);
        return;
      }

      // Refresh posts after adding comment
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };


  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment = {
        id: Math.random().toString(),
        authorName: 'You',
        text: commentText,
        createdAt: new Date().toISOString()
      };
      setComments([newComment, ...comments]);
      handleAddComment(post.id, commentText);
      setCommentText('');
    }
    
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCommentTime = (timeString: string): string => {
    if (timeString.includes('ago') || timeString.includes('Just now') || timeString === 'Recently') {
      return timeString;
    }
    
    return formatRelativeTime(timeString);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Post Header */}
      <div className="">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer">
              {post.user.avatar}
            </div>
            <div>
              <div className="flex items-center space-x-2 cursor-pointer">
                <h3 className="font-bold text-gray-900">{post.user.name}</h3>
              </div>
              <div title="Public" className="flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
                <span>{post.user.time}</span>
                <span><Globe  className='w-4 h-4'/></span>
              </div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mt-4 ">
          <p className="text-gray-800 px-4 text-lg whitespace-pre-line leading-relaxed">
            {post.content}
          </p>
          
          {/* Post Media */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4  overflow-hidden">
              {post.images.length === 1 && (
                <MediaItem url={post.images[0]} alt="Post media" className="w-full  object-cover" />
              )}
              {post.images.length === 2 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 2).map((url, idx) => (
                    <MediaItem key={idx} url={url} alt={`Post media ${idx + 1}`} className="w-full h-64 object-cover" />
                  ))}
                </div>
              )}
              {post.images.length >= 3 && (
                <div className="grid grid-cols-2 gap-2">
                  <MediaItem url={post.images[0]} alt="Post media 1" className="col-span-2 w-full  object-cover" />
                  {post.images.slice(1, 4).map((url, idx) => {
                    const isOverflow = idx === 2 && post.images.length > 4;
                    return (
                      <div key={idx} className="relative">
                        <MediaItem url={url} alt={`Post media ${idx + 2}`} className="w-full  object-cover" />
                        {isOverflow && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold text-xl">
                              +{post.images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Stats */}
        <div className=" pt-3 px-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    <FaThumbsUp />
                  </div>
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    <FaHeart />
                  </div>
                </div>
                <span className="ml-2 text-sm">{formatNumber(post.likes)}</span>
              </div>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className="text-sm  cursor-pointer"
              >
                {formatNumber(post.comments.length)} comments
              </button>
              
              <span className="text-sm">{formatNumber(post.shares)} shares</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Actions with Reactions */}
      <div className="border-gray-200 px-4 ">
        <div className="flex items-center relative">
          {/* Like Button with Reactions */}
          <div 
            className="relative flex-1 "
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={reactionsRef}
          >
            <button
              onClick={handleLikeButtonClick}
              className={`w-full flex items-center justify-center py-3 space-x-2 ${
                reaction ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {reaction ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xl ">
                    {reactions.find(r => r.type === reaction)?.icon}
                  </span>
                  <span className="font-medium">
                    {reactions.find(r => r.type === reaction)?.label}
                  </span>
                </div>
              ) : (
                <>
                 <div className='cursor-pointer flex gap-2 items-center '>
                   <ThumbsUp className="w-5 h-5 " />
                  <span className="font-medium ">Like</span>
                 </div>
                </>
              )}
            </button>

            {/* Reactions Popup */}
            {showReactions && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg border border-gray-200 p-1 flex items-center space-x-1 z-50 ">
                {reactions.map((react) => (
                  <button
                    className='cursor-pointer'
                    key={react.type}
                    onClick={() => handleReaction(react.type)}
                    onMouseEnter={() => setReaction(react.type)}
                    onMouseLeave={() => {
                      if (!post.liked) setReaction(null);
                      else setReaction('like');
                    }}
                    title={react.label}
                  >
                    {react.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center py-3 space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </button>
          
          {/* Share Button */}
          <button className="flex-1 flex items-center justify-center py-3 space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button type="button" className="text-gray-500 hover:text-gray-700">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button type="button" className="text-gray-500 hover:text-gray-700">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button type="submit" className="text-blue-500 hover:text-blue-600">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-linear-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm">
                  {comment.authorName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl px-4 py-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{comment.authorName}</h4>
                      <span className="text-xs text-gray-500">{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 mt-1">{comment.text}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <button className="hover:text-gray-700">Like</button>
                      <button className="hover:text-gray-700">Reply</button>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Comments */}
          <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
            View more comments
          </button>
        </div>
      )}
    </div>
  );
};

export default Post;
