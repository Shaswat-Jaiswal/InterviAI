import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CiUser, CiMail, CiLock, CiUnlock } from "react-icons/ci";
import { FaEye, FaEyeSlash, FaGoogle, FaGithub } from "react-icons/fa";
import { signupUser } from "../../api/authApi";

export const Signin = () => {
    const[fullName, setFullName] = useState("");
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[showPassword, setShowPassword] = useState(false);
    const[confirmPassword, setConfirmPassword] = useState("");
    const[showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async () => {
        if(!fullName || !email  || !password || !confirmPassword){
          alert("Please fill in all fields");
          return;
        }
         if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await signupUser({ fullName, email, password });

      localStorage.setItem("token", res.data.token);
      alert("Signup successful");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Signup failed";
      alert(msg);
    }
       }


    return(
        <div className="w-full h-[695px] bg-gray-400 p-7">

            <div className="flex bg-white w-[1480px] h-[645px] border-none rounded-3xl">
             <div className="w-1/2">
               <img
               src="/interview/Signin.jpeg"
               alt="siginimage"
               className="h-[645px] rounded-lg"
               />    
             </div>

             <div className="w-1/2">
             <h1 className="mt-[30px] font-bold text-2xl ">Signin in to your account</h1>
             <p className="mt-[2px] font-semibold  ">Analyze. Practice. Improve. Get hired.</p>

             <div className="block mt-[20px]">

                <label className=" font-bold ">Full Name</label>

                <div className="relative">

                    <CiUser className="absolute left-3 top-[25px] -translate-y-1/2 text-gray-500 text-xl" />

                    <input 
                    type="text"
                    value={fullName}
                    onChange={(e)=> setFullName(e.target.value)}
                    placeholder="Enter your fullname"
                   className={`mt-1 w-[400px] border rounded py-2 pr-3 ${
                    !fullName ? "pl-12" : "pl-12"
                     }`}
                    />
                </div>

                 <label className="block mt-2 font-bold">Email</label>

                <div className="relative">

                    <CiMail className="absolute left-3 top-[26px] -translate-y-1/2 text-gray-500 text-xl" />

                    <input 
                    type="email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    placeholder="Enter your email"
                   className={`mt-1 w-[400px] border rounded py-2 pr-2 ${
                    !email ? "pl-12" : "pl-12"
                     }`}
                    />
                </div>

                 <label className="block mt-2 font-bold ">Password</label>

                <div className="relative">

                     {password ? (
    <CiUnlock className="absolute left-3 top-[25px] -translate-y-1/2 text-gray-500 text-xl" />
  ) : (
    <CiLock className="absolute left-3 top-[25px] -translate-y-1/2 text-gray-500 text-xl" />
  )}

                    <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    placeholder="Enter your password"
                   className={`mt-1 w-[400px] border rounded py-2 pr-2 ${
                    !email ? "pl-12" : "pl-12"
                     }`}
                    />
                     
             <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             className="absolute left-[370px] top-6 -translate-y-1/2 text-gray-500"
              >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
             </button>
                </div>

                 <label className="block mt-2 font-bold ">Confirm Password</label>

                <div className="relative">

                     {password ? (
    <CiUnlock className="absolute left-3 top-[28px] -translate-y-1/2 text-gray-500 text-xl" />
  ) : (
    <CiLock className="absolute left-3 top-[28px] -translate-y-1/2 text-gray-500 text-xl" />
  )}

                    <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e)=> setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                   className={`mt-1 w-[400px] border rounded py-3 pr-2 ${
                    !email ? "pl-12" : "pl-12"
                     }`}
                    />
                     
             <button
             type="button"
             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             className="absolute left-[370px] top-7 -translate-y-1/2 text-gray-500"
              >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
             </button>
                </div>
             </div>

             <div className="  gap-[150px] mt-1">

    
         <label className=" flex items-center gap-1">
        <input type="checkbox" />
         <span className="font-medium">Remember Me</span>
        </label>
      </div>   

      <div className="mt-3">
        <button
          type="button"
          onClick={handleSignup}
          className="w-[410px] h-[45px] bg-purple-600 text-emerald-50 font-bold rounded-xl"
        >
          Signin
        </button>
      </div>
       
       <div className="flex gap-[30px] mt-[20px]">

    <FaGoogle className="absolute left-[780px] top-[575px] -translate-y-1/2 text-purple-600 text-xl" />
  
     <button
     className="  w-[250px] h-[50px] border-2 border-gray-200 rounded-2xl font-bold "
     >
      Continue with Google
     </button>
       
         <FaGithub className="absolute left-[1065px] top-[574px] -translate-y-1/2 text-purple-600 text-xl" />
      <button
      className="w-[250px] h-[50px] border-2 border-gray-200 rounded-2xl font-bold "
      >
        Continue with Github
        </button>

   </div>

   
        <div className="mt-2 ml-[120px]">
     <span className="text-gray-600">
      Already have an account?{" "}
     </span>

     <Link
    to="/login"
    className="text-purple-600 font-semibold"
  >
    Login
  </Link>
  </div>

      

             </div>
            </div>
        </div>
    )
}
