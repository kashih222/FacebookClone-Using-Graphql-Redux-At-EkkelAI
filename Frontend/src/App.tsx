import { Routes, Route } from "react-router-dom";
import Login from "./components/LoginPage/Login";
import SignUp from "./components/SignUpPage/SignUp";
import HomePage from "./components/HomePage/HomePage";
import CreateStoryPage from "./components/StoriesPage/CreateStoryPage";
import FriendsPage from "./components/FriendsPage/FriendsPageHome";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import FriendsSuggestion from "./components/FriendsPage/FriendsSuggestion";
import FriendRequest from "./components/FriendsPage/FriendRequest";
import FriendsPageHome from "./components/FriendsPage/FriendsPageHome";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="min-h-screen">
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/create-story" element={<CreateStoryPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/myprofile" element={<ProfilePage />} />
        <Route path="/friends-suggestion" element={<FriendsSuggestion />} />
        <Route path="/friend-request" element={<FriendRequest />} />
        <Route path="/friend-home" element={<FriendsPageHome />} />
      </Routes>
    </div>
  );
};

export default App;