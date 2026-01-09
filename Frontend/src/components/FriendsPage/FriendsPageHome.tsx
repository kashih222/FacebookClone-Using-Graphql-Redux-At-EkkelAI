import { UserPlus, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import FriendsPageSidebar from "./FriendsPageSidebar";
import { GET_MY_FRIENDS_QUERY, GET_FRIEND_REQUESTS_QUERY } from "../../GraphqlOprations/queries";
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
  isFriendRequest: true;
};

type FriendData = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  isFriendRequest?: false;
};

type MixedData = FriendRequestData | FriendData;

const FriendsPageHome = () => {
  const [mixedData, setMixedData] = useState<MixedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState<'all' | 'friends' | 'requests'>('all');

  useEffect(() => {
    loadMixedData();
  }, []);

  const loadMixedData = async () => {
    try {
      setLoading(true);
      
      // Load both friends and friend requests in parallel
      const [friendsRes, requestsRes] = await Promise.all([
        fetch(import.meta.env.VITE_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: GET_MY_FRIENDS_QUERY }),
        }),
        fetch(import.meta.env.VITE_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: GET_FRIEND_REQUESTS_QUERY }),
        })
      ]);

      const [friendsJson, requestsJson] = await Promise.all([
        friendsRes.json(),
        requestsRes.json()
      ]);

      const friends: FriendData[] = friendsJson.data?.myFriends?.map((friend: FriendData) => ({
        id: friend.id,
        firstName: friend.firstName,
        surname: friend.surname,
        email: friend.email,
        isFriendRequest: false
      })) || [];

      const friendRequests: FriendRequestData[] = requestsJson.data?.friendRequests?.map((request: FriendRequestData) => ({
        id: request.id,
        from: request.from,
        createdAt: request.createdAt,
        isFriendRequest: true
      })) || [];

      // Combine both arrays and shuffle them
      const combined = [...friends, ...friendRequests];
      // Optional: shuffle the array for mixed display
      const shuffled = combined.sort(() => Math.random() - 0.5);
      
      setMixedData(shuffled);
    } catch (error) {
      console.error("Failed to load data:", error);
      // Fallback mock data
      setMixedData([
        { id: "1", firstName: "John", surname: "Doe", email: "john@example.com", isFriendRequest: false },
        { id: "2", firstName: "Jane", surname: "Smith", email: "jane@example.com", isFriendRequest: false },
        { id: "req1", from: { id: "3", firstName: "Robert", surname: "Johnson", email: "robert@example.com" }, createdAt: new Date().toISOString(), isFriendRequest: true },
        { id: "4", firstName: "Emily", surname: "Williams", email: "emily@example.com", isFriendRequest: false },
        { id: "req2", from: { id: "5", firstName: "Michael", surname: "Brown", email: "michael@example.com" }, createdAt: new Date().toISOString(), isFriendRequest: true },
        { id: "6", firstName: "Sarah", surname: "Davis", email: "sarah@example.com", isFriendRequest: false },
      ]);
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
      // Refresh the data
      loadMixedData();
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
      // Refresh the data
      loadMixedData();
    } catch (error) {
      toast.error("Failed to reject friend request");
      console.error(error);
    }
  };

  const handleSeeAll = () => {
    console.log("See all");
  };

  const filteredData = mixedData.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'friends') return !item.isFriendRequest;
    if (activeTab === 'requests') return item.isFriendRequest;
    return true;
  });

  

  const getInitials = (firstName: string, surname: string) => {
    return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100 mt-14">
      {/* Header */}
      <Navbar />
      <div className="flex">
        {/* Left Sidebar */}
        <FriendsPageSidebar/>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Home</h1>
            <button 
              onClick={handleSeeAll}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              See all
            </button>
          </div>

          

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {activeTab === 'all' ? 'No friends or requests' : 
                 activeTab === 'friends' ? 'No friends yet' : 
                 'No friend requests'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'all' ? 'When you have friends or requests, they\'ll appear here.' :
                 activeTab === 'friends' ? 'Start adding friends to see them here.' :
                 'When you have friend requests, they\'ll appear here.'}
              </p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg">
                Find Friends
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map((item) => {
                  const isRequest = 'isFriendRequest' in item && item.isFriendRequest;
                  const firstName = isRequest ? item.from.firstName : item.firstName;
                  const surname = isRequest ? item.from.surname : item.surname;
                  const initials = getInitials(firstName, surname);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Profile Image */}
                      <div className={`h-48 relative ${isRequest ? 'bg-linear-to-r from-blue-500 to-purple-500' : 'bg-linear-to-r from-green-500 to-teal-500'}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white">
                            <span className="text-4xl font-bold text-gray-800">
                              {initials}
                            </span>
                          </div>
                        </div>
                        {isRequest && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Request
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          {firstName} {surname}
                        </h3>

                        {/* Time for requests */}
                        {isRequest && (
                          <p className="text-sm text-gray-500 mb-4">
                            {formatTimeAgo(item.createdAt)}
                          </p>
                        )}

                        {/* Action Buttons */}
                        {isRequest ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptRequest(item.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                              <Check className="w-4 h-5" />
                              <span className="text-sm">Confirm</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(item.id)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                              <X className="w-4 h-5" />
                              <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        ) : (
                          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors">
                            Message
                          </button>
                        )}
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

                         </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPageHome;
