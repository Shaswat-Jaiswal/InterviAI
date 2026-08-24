import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { CiMail } from "react-icons/ci";
import { CiLock, CiUnlock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub } from "react-icons/fa";
import { loginUser } from "../../api/authApi";

export const Login = () => {

const[email, setEmail] = useState("");
const[password, setPassword] = useState("");
const[showPassword, setShowPassword] = useState(false);
const navigate = useNavigate();

 const handleLogin = async () => {
    if (!email || !password) {
  alert("Please enter email and password");
  return;
}

try {
      const res = await loginUser({
        email,
        password,
      });

      // Save token and user data to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";
      alert(msg);
    }
  };



    return(
        <div className="bg-blue-100 w-full h-[695px] p-5">
            <div className=" flex bg-blue-200 w-full  h-[650px]  rounded-3xl">
           <div className="w-1/2 flex">
            <img 
            src="/interview/Image.png"
            alt="Login Image"
            className=" w-[600px] h-full border border-xl rounded-3xl"
            />
            <div className="w-1/2 ">
            <div className="absolute top-7 right-8  text-sm">
  <span className="text-gray-500">New here?</span>

  <Link
    to="/signin"
    className="ml-2 text-purple-600 font-semibold hover:text-purple-800"
  >
    Signup
  </Link>
</div>

 <div className="mt-[60px] ml-[50px] w-[600px] h-[550px] bg-white rounded-lg pt-[50px] pl-[50px]">
    
    <h1 className="font-extrabold text-3xl">
      Welcome Back
    </h1>
   <p className="mt-[5px] font-bold">Login to continue your journey</p>

   <div className="flex gap-[30px] mt-[20px]">

    <FaGoogle className="absolute left-[685px] top-[238px] -translate-y-1/2 text-purple-600 text-xl" />
  
     <button
     className="  w-[250px] h-[50px] border border-gray-200 rounded-2xl font-bold "
     >
      Continue with Google
     </button>
       
         <FaGithub className="absolute left-[960px] top-[238px] -translate-y-1/2 text-purple-600 text-xl" />
      <button
      className="w-[250px] h-[50px] border border-gray-200 rounded-2xl font-bold "
      >
        Continue with Github
        </button>

   </div>

   <div className="flex items-center w-[400px] my-4 ml-[65px]">
  <div className="flex-1  border-t-2 border-gray-300"></div>
  <span className="px-3 text-sm text-gray-500 font-bold">or</span>
  <div className="flex-1 border-t-2 border-gray-300"></div>
</div>

<div className="block">

  <label className="font-bold">Email</label>
  

<div className="relative  ">


  <CiMail className="absolute left-2  top-[18px] translate-0 text-xl"/>

  <input
  type="email"
  value={email}
  onChange={(e)=> setEmail (e.target.value)}
  placeholder="Enter your email"
    className="mt-2 w-[400px] font-medium border rounded py-2 pl-12 pr-12"
  />
</div>
</div>

<div className="block mt-2">
  <label className="font-bold">Password</label>

  <div className="relative">
    {password ? (
      <CiUnlock className="absolute left-3 top-[26px] -translate-y-1/2 text-xl" />
    ) : (
      <CiLock className="absolute left-3 top-[26px] -translate-y-1/2 text-xl" />
    )}

    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your Password"
      className="mt-2 w-[400px] font-medium border rounded py-2 pl-12 pr-12"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-[160px] top-[28px] -translate-y-1/2 text-gray-500"
    >
      {showPassword ? <FaEye /> : <FaEyeSlash />}
    </button>
  </div>
</div>

<div className="flex  gap-[150px] mt-2">

          {/* Left Side */}
         <label className="flex items-center gap-1">
        <input type="checkbox" />
         <span className="font-medium">Remember Me</span>
        </label>

       {/* Right Side */}
       <button className="text-purple-600 ">
        Forgot Password?
      </button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleLogin}
          className="w-[410px] h-[45px] bg-purple-600 text-emerald-50 font-bold rounded-xl"
        >
          Login
        </button>
      </div>

      

  </div>

            </div>
            </div>

            </div>
        </div>
    )
}