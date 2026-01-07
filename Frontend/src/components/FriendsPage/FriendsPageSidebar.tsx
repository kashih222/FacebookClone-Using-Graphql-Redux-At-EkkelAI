import { Columns3Cog, Gift, Settings, UserPlus, UserRoundCheck, Users, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

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
          <div className="flex items-center gap-2 px-3 py-2  border-b-gray-300 hover:bg-gray-200 cursor-pointer bg-blue-50">
            <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center text-blue-600 font-bold">
              <Users />
            </div>
           <Link to={"/friend-home"}>
             <div className="w-full ">
              <p className="font-medium text-lg ">Home</p>
            </div>
           </Link>
          </div>
          <div className="flex items-center gap-2 px-3 py-2  border-b-gray-300 hover:bg-gray-200 cursor-pointer ">
            <div className="w-12 h-10 bg-blue-100 rounded-full flex items-center justify-center text-black font-bold">
              <UserPlus />
            </div>
           <Link to={"/friend-request"}>
            <div className="w-full ">
              <p className="font-medium text-lg">Friend requests</p>
            </div>
           </Link>
          </div>
          <div className="flex items-center gap-2 px-3 py-2  border-b-gray-300 hover:bg-gray-200 cursor-pointer">
            <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center text-black font-bold">
              <UsersRound />
            </div>
           <Link to={"/friends-suggestion"}>
            <div className="w-full ">
              <p className="font-medium text-lg">Suggestions</p>
            </div>
           </Link>
          </div>
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
  )
}

export default FriendsPageSidebar
