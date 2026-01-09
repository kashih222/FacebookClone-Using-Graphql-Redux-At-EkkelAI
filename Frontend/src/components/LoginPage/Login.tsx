import { useState } from "react";
import Logo from "../../assets/4lCu2zih0ca.svg";
import LoginSignUpFooter from "../Login&Signup Footer/LoginSignUpFooter";
import { Link, useNavigate } from "react-router-dom";
import { LOGIN_MUTATION } from "../../GraphqlOprations/mutations";
import { useAppDispatch } from "../../Redux Toolkit/hooks";
import { setUser, fetchMe } from "../../Redux Toolkit/slices/userSlice";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: { email: formData.email, password: formData.password },
        }),
      });
      const json = await res.json();
      if (json.errors && json.errors.length) {
        toast.error(json.errors[0].message || "Login failed");
        return;
      }
      if (json.data?.login?.user) {
        dispatch(setUser(json.data.login.user));
      }
      dispatch(fetchMe());
      navigate("/");
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 h-[calc(100vh-240px)] w-full bg-[#F2F4F7] flex items-center justify-center gap-10 py-8 px-4">
        <div className="container max-w-6xl flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20">
          
          <div className="flex flex-col items-start gap-2 max-w-md">
            <div className="w-[320px] h-auto mb-4">
              <img 
                src={Logo} 
                alt="Facebook Logo" 
                className="w-full h-auto -ml-3"
              />
            </div>
            <p className="text-2xl font-medium pl-2 md:pl-8 text-gray-800 leading-snug">
              Facebook helps you connect and share with the people in your life.
            </p>
          </div>

          <div className="flex flex-col w-full max-w-md">
            <div className="flex flex-col justify-center items-center gap-4 w-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] p-6 md:p-8 rounded-lg">
              <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
                <input
                  type="text"
                  name="email"
                  placeholder="Email address or phone number"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-[#CCD0D5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent text-base"
                />
                
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-[#CCD0D5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent text-base"
                />
                
                <button
                  type="submit"
                  className="w-full bg-[#1877F2] text-white font-bold px-4 py-3.5 rounded-md hover:bg-[#166FE5] transition-colors text-lg"
                >
                  Log In
                </button>
              </form>

              <a
                href="#"
                className="text-[#1877F2] hover:underline text-sm text-center py-2"
              >
                Forgotten password?
              </a>

              <div className="w-full border-t border-[#CCD0D5] my-2"></div>

             
             <Link to={"/signup"}> <button className="bg-[#36A420] hover:bg-[#2B9217] text-white font-bold px-6 py-3.5 rounded-md transition-colors text-base">
                Create new account
              </button></Link>
            </div>

            <div className="mt-6 text-center md:text-left md:ml-20">
              <span className="font-bold text-sm">
                <a href="#" className="hover:underline text-gray-800">
                  Create a Page
                </a>
              </span>
              <span className="text-sm text-gray-600 ml-1 ">
                for a celebrity, brand or business.
              </span>
            </div>
          </div>
        </div>
      </div>

      <LoginSignUpFooter />
    </div>
  );
};

export default Login;
