import { UserPlus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import FriendsPageSidebar from "./FriendsPageSidebar";
import { GET_FRIEND_REQUESTS_QUERY } from "../../GraphqlOprations/queries";
import { ACCEPT_FRIEND_REQUEST_MUTATION, REJECT_FRIEND_REQUEST_MUTATION } from "../../GraphqlOprations/mutations";
import toast from "react-hot-toast";

type FriendRequestData = {
  id: string;
  from: {
    id: string;
    firstName: string;
    surname: string;
    email: string;
  };
  createdAt: string;
};

const FriendRequest = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const loadFriendRequests = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: GET_FRIEND_REQUESTS_QUERY }),
      });
      const json = await res.json();
      if (json.errors && json.errors.length) {
        console.error("Error loading friend requests:", json.errors[0].message);
        return;
      }
      setFriendRequests(json.data?.friendRequests || []);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          query: ACCEPT_FRIEND_REQUEST_MUTATION, 
          variables: { requestId } 
        }),
      });
      const json = await res.json();
      if (json.errors && json.errors.length) {
        toast.error(json.errors[0].message || "Failed to accept friend request");
        return;
      }
      // Remove from list
      setFriendRequests(prev => prev.filter(request => request.id !== requestId));
    } catch (error) {
      toast.error("Failed to accept friend request");
      console.error(error);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          query: REJECT_FRIEND_REQUEST_MUTATION, 
          variables: { requestId } 
        }),
      });
      const json = await res.json();
      if (json.errors && json.errors.length) {
        toast.error(json.errors[0].message || "Failed to reject friend request");
        return;
      }
      // Remove from list
      setFriendRequests(prev => prev.filter(request => request.id !== requestId));
    } catch (error) {
      toast.error("Failed to reject friend request");
      console.error(error);
    }
  };

  const handleSeeAll = () => {
    console.log("See all friend requests");
  };

  return (
    <div className="min-h-screen bg-gray-100 mt-14">
      {/* Header */}
      <Navbar />
      <div className="flex">
        <FriendsPageSidebar/>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Friend Request</h1>
            <button 
              onClick={handleSeeAll}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              See all
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading friend requests...</p>
            </div>
          ) : friendRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No friend requests
              </h3>
              <p className="text-gray-500">
                When you have friend requests, they'll appear here.
              </p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg">
                Find Friends
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {friendRequests.map((request) => {
                  const initials = `${request.from.firstName.charAt(0)}${request.from.surname.charAt(0)}`.toUpperCase();
                  return (
                    <div 
                      key={request.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Profile Image */}
                      <div className="h-48 bg-linear-to-r from-blue-500 to-purple-500 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white">
                            <span className="text-4xl font-bold text-gray-800">
                              {initials}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          {request.from.firstName} {request.from.surname}
                        </h3>
                        
                        {/* Time */}
                        <p className="text-sm text-gray-500 mb-4">
                          {formatTimeAgo(request.createdAt)}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                          >
                            <Check className="w-4 h-5" />
                            <span className="text-sm flex items-center justify-center">Confirm</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                          >
                            <X className="w-4 h-5" />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Friend Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-10 h-10 text-gray-600" />
                      </div>
                      <p className="text-gray-600 font-medium">Add more friends</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
                      Find Friends
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-8 pt-6 border-t border-gray-300">
                <p className="text-sm text-gray-500">
                  People you may know based on your mutual friends and activities.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequest;