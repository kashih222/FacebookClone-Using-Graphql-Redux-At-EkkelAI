import {
  Columns3Cog,
  Gift,
  Settings,
  UserPlus,
  UserRoundCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const FriendsPageSidebar = () => {
  return (
    <div>
      <div className="w-90 h-screen bg-[#FFFFFF] flex-col shadow-lg sticky top-10  overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-4">
          <div>
            <p className="font-bold text-2xl">Friends</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-200 cursor-pointer flex items-center justify-center">
            <Settings />
          </div>
        </div>

        <NavLink to="/friend-home">
          {({ isActive }) => (
            <div
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer
        ${
          isActive
            ? "bg-blue-200 text-blue-600"
            : "text-black hover:bg-gray-200"
        }
      `}
            >
              <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                <Users />
              </div>
              <p className="font-medium text-lg">Home</p>
            </div>
          )}
        </NavLink>

        <NavLink to="/friend-request">
          {({ isActive }) => (
            <div
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer
        ${
          isActive
            ? "bg-blue-200 text-blue-600"
            : "text-black hover:bg-gray-200"
        }
      `}
            >
              <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                <UserPlus />
              </div>
              <p className="font-medium text-lg">Friend requests</p>
            </div>
          )}
        </NavLink>

        <NavLink to="/friends-suggestion">
          {({ isActive }) => (
            <div
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer
        ${
          isActive
            ? "bg-blue-200 text-blue-600"
            : "text-black hover:bg-gray-200"
        }
      `}
            >
              <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
                <UsersRound />
              </div>
              <p className="font-medium text-lg">Suggestions</p>
            </div>
          )}
        </NavLink>

        <div className="flex items-center gap-2 px-3 py-2  border-b-gray-300 hover:bg-gray-200 cursor-pointer">
          <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center text-black font-bold">
            <UserRoundCheck />
          </div>
          <div className="w-full ">
            <p className="font-medium text-lg">All friends</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2  border-b-gray-300 hover:bg-gray-200 cursor-pointer">
          <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center text-black font-bold">
            <Gift />
          </div>
          <div className="w-full ">
            <p className="font-medium text-lg">Birthday</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2  border-b-gray-300 hover:bg-gray-200 cursor-pointer">
          <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center text-black font-bold">
            <Columns3Cog />
          </div>
          <div className="w-full ">
            <p className="font-medium text-lg">Custom list</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPageSidebar;
