import {
  Camera,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Edit,
  BarChart,
  ChevronDown,
  Ellipsis,
} from "lucide-react";
import Navbar from "../Navbar/Navbar";
import CreatePost from "../CreatePostPage/CreatePost";
import PostFilter from "./PostFilter";
import PersonalFeed from "./PersonalFeed";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Redux Toolkit/hooks";
import { fetchMe } from "../../Redux Toolkit/slices/userSlice";
import {
  GET_MY_FRIENDS_QUERY,
  GET_MY_POSTS_QUERY,
  GET_VIEW_URLS_MUTATION,
} from "../../GraphqlOprations/queries";

interface Friend {
  id: string;
  firstName: string;
  surname: string;
  email: string;
}

export interface User {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  posts?: { imageUrl: string }[];
}

interface Post {
  imageUrl?: string;
  imageUrls?: string[];
}

const ProfilePage = () => {
  const personalFeedRef = useRef<{ refresh: () => void } | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);

  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.user.user);

  const displayName = me ? `${me.firstName} ${me.surname}` : "Konsus Mysvak";
  const initials = displayName
    .split(" ")
    .map((p) => p[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

  useEffect(() => {
    dispatch(fetchMe());
    loadFriendsData();
    loadPhotos();
  }, [dispatch]);

  const loadPhotos = async () => {
    try {
      setPhotoLoading(true);

      // Step 1: Get all posts to extract image URLs
      const postsRes = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: GET_MY_POSTS_QUERY,
        }),
      });

      const postsJson = await postsRes.json();

      if (postsJson.errors && postsJson.errors.length) {
        console.error("Error loading posts:", postsJson.errors[0].message);
        setPhotos([]);
        return;
      }

      // Extract ALL image URLs from posts
      const rawImageUrls: string[] = [];

      if (postsJson.data?.myPosts) {
        postsJson.data.myPosts.forEach((post: Post) => {
          // 1. Add the main imageUrl if it exists
          if (post.imageUrl && post.imageUrl.trim() !== "") {
            rawImageUrls.push(post.imageUrl.trim());
          }

          // 2. Add all images from imageUrls array if it exists
          if (post.imageUrls && Array.isArray(post.imageUrls)) {
            post.imageUrls.forEach((url: string) => {
              if (url && url.trim() !== "") {
                rawImageUrls.push(url.trim());
              }
            });
          }
        });
      }

      if (rawImageUrls.length === 0) {
        setPhotos([]);
        return;
      }

      // Step 2: Convert S3 URLs to viewable URLs using the mutation
      const viewUrlsRes = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: GET_VIEW_URLS_MUTATION,
          variables: {
            urls: rawImageUrls.slice(0, 9), // Limit to 9 URLs for the mutation
          },
        }),
      });

      const viewUrlsJson = await viewUrlsRes.json();

      if (viewUrlsJson.errors && viewUrlsJson.errors.length) {
        console.error("Error converting URLs:", viewUrlsJson.errors[0].message);
        // Fallback to using raw URLs if conversion fails
        setPhotos(rawImageUrls.slice(0, 9));
        return;
      }

      // Get the converted URLs from the mutation response
      const convertedUrls = viewUrlsJson.data?.getViewUrls || [];

      const validUrls = convertedUrls.filter(
        (url: string) => url && url.trim() !== ""
      );

      setPhotos(validUrls.slice(0, 9));

      console.log("Loaded photos:", validUrls.length, "converted images");
    } catch (err) {
      console.error("Photo load failed", err);
      setPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  };

  const loadFriendsData = async () => {
    try {
      setLoading(true);

      // Use the actual GraphQL query
      const response = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: GET_MY_FRIENDS_QUERY,
        }),
      });

      const json = await response.json();

      if (json.errors && json.errors.length) {
        console.error("Error loading friends:", json.errors[0].message);
        return;
      }

      if (json.data?.myFriends) {
        setFriends(json.data.myFriends);
        setFriendsCount(json.data.myFriends.length);
      } else {
        setFriends([]);
        setFriendsCount(0);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFriendInitials = (firstName: string, surname: string) => {
    return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const displayedFriends = friends.slice(0, 6);

  return (
    <div className="w-full">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="bg-[#FFFFFF] w-full min-h-screen flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-center bg-linear-to-t from-white to-gray-200">
            <div className="lg:container xl:container w-full px-4 md:px-6 lg:px-24 xl:px-40">
              {/* Cover Photo Section */}
              <div className="relative h-96 bg-linear-to-r from-blue-600 to-purple-600">
                <div className="absolute bottom-4 right-4">
                  <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                    <Camera size={20} />
                    <span className="font-semibold ">Edit cover photo</span>
                  </button>
                </div>

                {/* Profile Picture */}
                <div className="absolute -bottom-10 xl:-bottom-16 left-8">
                  <div className="relative">
                    <div className="w-20 h-20 lg:w-40 lg:h-40 rounded-full border-4 border-white bg-linear-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl lg:text-6xl font-bold">
                      {initials}
                    </div>
                    <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                      <Camera className="w-3 h-3 lg:w-6 lg:h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="px-8 pt-20 pb-6 bg-[#FFFFFF]">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {displayName}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      0 followers {friendsCount} friends
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                      <BarChart size={20} />
                      <span>Dashboard</span>
                    </button>

                    <button className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition">
                      <Edit size={20} />
                      <span className="font-medium">Edit </span>
                    </button>
                    <button className="flex items-center gap-2 bg-gray-200 p-2 rounded-lg cursor-pointer hover:bg-gray-300 transition">
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 border-gray-200 border-t">
                  <div className="flex items-center">
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      Post
                    </button>
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      About
                    </button>
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      Reel
                    </button>
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      Photos
                    </button>
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      Group
                    </button>
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      Events
                    </button>
                    <button className="flex items-center pt-4 px-4 text-sm cursor-pointer font-semibold text-gray-500 hover:text-gray-800">
                      <span>More</span>
                      <ChevronDown className="w-4" />
                    </button>
                  </div>
                  <div className="bg-[#D6D9DD] text-black rounded-sm py-2 px-3 mt-2 cursor-pointer">
                    <Ellipsis />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F2F4F7] w-full">
            <div className="lg:container xl:container px-4 md:px-6 lg:px-24 xl:px-40 w-full mx-auto py-6 grid grid-cols-3 gap-6">
              {/* Left Sidebar */}
              <div className="col-span-1 space-y-6">
                {/* Intro Card */}
                <div className="bg-white rounded-lg shadow p-3">
                  <h2 className="text-xl font-bold mb-4">Intro</h2>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase size={20} className="text-gray-500" />
                      <span>@MERN Intern at EkkelAI</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <GraduationCap size={30} className="text-gray-500" />
                      <div>
                        <p>Studies at PU</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-gray-500" />
                      <span>Lives in Lahore</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-gray-500" />
                      <span>From ShakarGarh</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Heart size={20} className="text-gray-500" />
                      <span>In Relationship</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold">
                    Edit details
                  </button>
                  <button className="w-full mt-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-semibold">
                    Add feature
                  </button>
                </div>

                {/* Photos Card */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Photos</h2>
                    <button className="text-blue-600 hover:underline cursor-pointer">
                      See All Photos
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {photoLoading ? (
                      Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-full h-24 bg-gray-200 rounded-md animate-pulse"
                        ></div>
                      ))
                    ) : photos.length === 0 ? (
                      <div className="col-span-3 text-center py-6">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No photos yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Upload your first photo!
                        </p>
                      </div>
                    ) : (
                      photos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          className="w-full h-24 object-cover rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                          alt={`Photo ${i + 1}`}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;

                            img.src =
                              "https://via.placeholder.com/150?text=Image+Error";
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Friends Card */}
                <div className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Friends</h2>
                    <Link to={"/friends"}>
                      <button className="text-blue-600 hover:underline cursor-pointer">
                        See all friends
                      </button>
                    </Link>
                  </div>

                  <p className="text-gray-600 mb-4">{friendsCount} friends</p>

                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading friends...</p>
                    </div>
                  ) : displayedFriends.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No friends yet</p>
                      <Link to="/friends">
                        <button className="mt-2 text-blue-600 hover:underline">
                          Find friends
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {displayedFriends.map((friend) => (
                        <div key={friend.id} className="text-center">
                          <div className="w-full aspect-square bg-linear-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-2">
                            {getFriendInitials(
                              friend.firstName,
                              friend.surname
                            )}
                          </div>
                          <p className="text-sm font-semibold truncate">
                            {friend.firstName} {friend.surname.charAt(0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                {/* Create Post */}
                <div>
                  <CreatePost
                    onPostCreated={() => {
                      if (personalFeedRef.current) {
                        personalFeedRef.current.refresh();
                      }
                    }}
                  />
                </div>

                <div>
                  <PostFilter />
                </div>

                <div>
                  <PersonalFeed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
