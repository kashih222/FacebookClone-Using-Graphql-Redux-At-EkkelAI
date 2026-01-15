import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaSearch,
  FaHome,
  FaPlayCircle,
  FaStore,
  FaUsers,
  FaGamepad,
  FaBell,
  FaCommentDots,
  FaCaretDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  LogOut,
  Logs,
  MessageCircleQuestionMark,
  MessageSquareDot,
  Moon,
  Settings,
  User,
  UserRoundPen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../Redux Toolkit/hooks";
import { fetchMe, clearUser } from "../../Redux Toolkit/slices/userSlice";
import { LOGOUT_MUTATION } from "../../GraphqlOprations/mutations";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setShowSearch] = useState(false);
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.user.user);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMe());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setShowSearch(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
      <div className=" px-3 sm:px-4 md:px-6 w-full">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left Section: Logo & Search */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-1">
            <Link to="/" className="flex items-center space-x-2">
              <FaFacebook className="text-blue-600 text-3xl sm:text-4xl" />
            </Link>
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className=" relative flex-1 ">
              <div className="sm:hidden lg:inline-block relative w-50">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Facebook"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-3xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </form>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl text-gray-600" />
            ) : (
              <FaBars className="text-2xl text-gray-600" />
            )}
          </button>

          {/* Center Section: Navigation Icons - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-2 lg:space-x-12">
            <NavLink to="/" end>
              {({ isActive }) => (
                <button
                  className={`relative flex items-center justify-center w-16 lg:w-20 h-14 rounded-md cursor-pointer
          ${isActive ? "text-blue-600" : "hover:bg-gray-100"}
        `}
                >
                  <FaHome
                    className={`text-2xl ${
                      isActive ? "text-blue-600" : "text-[#606366]"
                    }`}
                  />

                  {/* Active bottom bar */}
                  <div
                    className={`absolute bottom-0 w-16 lg:w-20 h-1 bg-blue-600 rounded-t-lg
            ${isActive ? "opacity-100" : "opacity-0"}
          `}
                  />
                </button>
              )}
            </NavLink>

            {/* Friends */}
            <NavLink to="/friends">
              {({ isActive }) => (
                <button
                  className={`relative flex items-center justify-center w-16 lg:w-20 h-14 rounded-md cursor-pointer
          ${isActive ? "text-blue-600" : "hover:bg-gray-100"}
        `}
                >
                  <FaUsers
                    className={`text-2xl ${
                      isActive ? "text-blue-600" : "text-[#606366]"
                    }`}
                  />
                  <div
                    className={`absolute bottom-0 w-16 lg:w-20 h-1 bg-blue-600 rounded-t-lg
            ${isActive ? "opacity-100" : "opacity-0"}
          `}
                  />
                </button>
              )}
            </NavLink>
            <button className="flex items-center justify-center w-16 lg:w-20 h-14 rounded-md hover:bg-gray-100 cursor-pointer group">
              <FaPlayCircle className="text-2xl text-[#606366] group-hover:text-blue-600" />
              <div className="absolute bottom-0 w-16 lg:w-20 h-1 bg-blue-600 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button className="flex items-center justify-center w-16 lg:w-20 h-14 rounded-md hover:bg-gray-100 cursor-pointer group">
              <FaStore className="text-2xl text-[#606366] group-hover:text-blue-600" />
              <div className="absolute bottom-0 w-16 lg:w-20 h-1 bg-blue-600 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button className="flex items-center justify-center w-16 lg:w-20 h-14 rounded-md hover:bg-gray-100 cursor-pointer group">
              <FaGamepad className="text-2xl text-[#606366] group-hover:text-blue-600" />
              <div className="absolute bottom-0 w-16 lg:w-20 h-1 bg-blue-600 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Right Section: User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-1 justify-end">
            <button className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 relative cursor-pointer">
              <Logs className="text-lg lg:text-xl" />
            </button>
            <button className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 relative cursor-pointer">
              <FaCommentDots className="text-lg lg:text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                3
              </span>
            </button>

            <button className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 relative cursor-pointer">
              <FaBell className="text-lg lg:text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                5
              </span>
            </button>

            {/* Account Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 cursor-pointer">
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {(me?.firstName?.[0] || "U").toUpperCase()}
                </div>
                <FaCaretDown className="hidden lg:inline text-gray-500" />
              </button>

              {/* Account Dropdown */}
              <div className="absolute right-0 mt-2 w-72 lg:w-84 bg-[#FDFDFD] rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex flex-col gap-4 bg-[#F2F2F2] p-3 lg:p-4 rounded-xl">
                    <Link
                      to={"/myprofile"}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2.5 bg-[#F2F2F2]">
                        <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(me?.firstName?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="cursor-pointer">
                          <p className="font-semibold text-sm lg:text-base">
                            {me ? `${me.firstName} ${me.surname}` : "User Name"}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <hr />
                    <div className="flex items-center bg-[#D6D9DD] rounded-xl gap-3 lg:gap-4 p-3 lg:p-4 cursor-pointer">
                      <div>
                        <UserRoundPen className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <div className="font-medium text-sm lg:text-base">
                        See all profiles
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 my-1"></div>

                <div className="py-2">
                  <button className="w-full flex items-center px-3 lg:px-4 py-2 hover:bg-[#F2F2F2] text-left">
                    <Settings className="text-black mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="font-medium text-gray-700 text-sm lg:text-base">
                      Settings & Privacy
                    </span>
                  </button>
                  <button className="w-full flex items-center px-3 lg:px-4 py-2 hover:bg-[#F2F2F2] text-left">
                    <MessageCircleQuestionMark className="text-black mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="font-medium text-gray-700 text-sm lg:text-base">
                      Help & Support
                    </span>
                  </button>
                  <button className="w-full flex items-center px-3 lg:px-4 py-2 hover:bg-[#F2F2F2] text-left">
                    <Moon className="text-black mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="font-medium text-gray-700 text-sm lg:text-base">
                      Display & accessibility
                    </span>
                  </button>
                  <button className="w-full flex items-center px-3 lg:px-4 py-2 hover:bg-[#F2F2F2] text-left">
                    <MessageSquareDot className="text-black mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6" />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 text-sm lg:text-base">
                        Give feedback
                      </span>
                      <span className="text-xs text-gray-500">CTRL B</span>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          import.meta.env.VITE_GRAPHQL_URL,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ query: LOGOUT_MUTATION }),
                          }
                        );
                        const json = await res.json();
                        if (json.errors && json.errors.length) {
                          console.error(
                            json.errors[0].message || "Logout failed"
                          );
                        }
                      } catch {
                        console.error("Network error during logout");
                      } finally {
                        dispatch(clearUser());
                        navigate("/login");
                      }
                    }}
                    className="w-full flex items-center px-3 lg:px-4 py-2 hover:bg-red-500 hover:text-white text-left"
                  >
                    <LogOut className="mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="font-medium text-sm lg:text-base">
                      Log Out
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-2 py-2 px-3 lg:px-4 text-xs lg:text-sm text-gray-700">
                    <a className="hover:underline" href="#">
                      Terms
                    </a>
                    <a className="hover:underline" href="#">
                      Advertising
                    </a>
                    <a className="hover:underline" href="#">
                      Ad choice
                    </a>
                    <a className="hover:underline" href="#">
                      Privacy
                    </a>
                    <a className="hover:underline" href="#">
                      Cookies
                    </a>
                    <a href="#">More</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0  bg-opacity-50 z-40"
            onClick={toggleMobileMenu}
          ></div>
        )}

        {/* Mobile Menu Sidebar */}
        <div
          className={`md:hidden fixed top-14 right-0 h-[calc(100vh-56px)] w-80 bg-white shadow-xl transform transition-transform duration-300 z-40 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto py-4">
            {/* User Profile Section */}
            <div className="px-4 py-3 border-b border-gray-200">
              <Link to={"/myprofile"} onClick={toggleMobileMenu}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100">
                  <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(me?.firstName?.[0] || "U").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {me ? `${me.firstName} ${me.surname}` : "User Name"}
                    </p>
                    <p className="text-sm text-gray-600">See your profile</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="py-4">
              <div className="px-4 font-semibold text-gray-500 text-sm mb-2">
                MENU
              </div>

              {/* Home */}
              <NavLink to="/" onClick={toggleMobileMenu}>
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-4 py-3
          ${
            isActive
              ? "border-b-2 border-blue-600 text-blue-600"
              : "hover:bg-gray-100"
          }
        `}
                  >
                    <FaHome className="text-2xl" />
                    <span className="font-medium">Home</span>
                  </div>
                )}
              </NavLink>

              {/* Friends */}
              <NavLink to="/friends" onClick={toggleMobileMenu}>
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-4 py-3
          ${
            isActive
              ? "border-b-2 border-blue-600 text-blue-600"
              : "hover:bg-gray-100"
          }
        `}
                  >
                    <FaUsers className="text-2xl" />
                    <span className="font-medium">Friends</span>
                  </div>
                )}
              </NavLink>

              {/* Watch */}
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
                <FaPlayCircle className="text-2xl text-red-500" />
                <span className="font-medium">Watch</span>
              </div>

              {/* Marketplace */}
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
                <FaStore className="text-2xl text-blue-700" />
                <span className="font-medium">Marketplace</span>
              </div>

              {/* Gaming */}
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
                <FaGamepad className="text-2xl text-green-500" />
                <span className="font-medium">Gaming</span>
              </div>
            </div>

            {/* Settings Section */}
            <div className="py-4 border-t border-gray-200">
              <div className="px-4 font-semibold text-gray-500 text-sm mb-2">
                SETTINGS
              </div>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
                <Settings className="text-gray-700" />
                <span className="font-medium">Settings & Privacy</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
                <MessageCircleQuestionMark className="text-gray-700" />
                <span className="font-medium">Help & Support</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
                <Moon className="text-gray-700" />
                <span className="font-medium">Display & Accessibility</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ query: LOGOUT_MUTATION }),
                    });
                    const json = await res.json();
                    if (json.errors && json.errors.length) {
                      console.error(json.errors[0].message || "Logout failed");
                    }
                  } catch {
                    console.error("Network error during logout");
                  } finally {
                    dispatch(clearUser());
                    navigate("/login");
                    toggleMobileMenu();
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500 hover:text-white text-left"
              >
                <LogOut />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
       <div className="w-full items-center justify-center">
         <div className="lg:hidden flex items-center w-full justify-center gap-13 md:gap-22 py-2 border-t border-gray-200">
          <NavLink to={"/"}>
            <button className="flex flex-col items-center flex-1 text-blue-600">
              <FaHome className="text-xl" />
              <span className="text-xs mt-1">Home</span>
            </button>
          </NavLink>

          <NavLink to={"/friends"}>
            <button className="flex flex-col items-center flex-1 text-gray-500">
            <User className="text-xl" />
            <span className="text-xs mt-1">Friends</span>
          </button>
          </NavLink>

          <NavLink to={"#"}>
            <button className="flex flex-col items-center flex-1 text-gray-500">
            <FaUsers className="text-xl" />
            <span className="text-xs mt-1">Groups</span>
          </button>
          </NavLink>

          <NavLink to={"#"}>
            <button className="flex flex-col items-center flex-1 text-gray-500 relative">
            <FaBell className="text-xl" />
            <span className="absolute -top-1 right-6 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              5
            </span>
            <span className="text-xs mt-1">Notifs</span>
          </button>
          </NavLink>

          <NavLink to={"#"}>
            <button className="flex flex-col items-center flex-1 text-gray-500">
            <FaCommentDots className="text-xl" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          </NavLink>
        </div>
       </div>
      </div>
    </nav>
  );
};

export default Navbar;
