import { FiMenu, 
     FiBell,
     FiChevronDown,
     FiRefreshCw,
     FiTrendingUp,
     FiEdit3,
     FiAlertTriangle,
     FiCheckCircle,
} from  "react-icons/fi";

import { FaUser } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { getResumes,  reanalyzeResume } from "../../api/authApi";

export const ResumeAnalyzer = () => {
    const[user, setUser] = useState(null);
    const[showEmail, setShowEmail] = useState(false);
    const [currentResume, setCurrentResume] = useState(null);
    const [reanalyzing, setReanalyzing] = useState(false);

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

    useEffect(() => {
       const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(storedUser);

         const loadCurrentResume = async () => {
    try {
      const response = await getResumes();
      setCurrentResume(response.data.resumes?.[0] || null);
    } catch (error) {
      console.error("Resume load error:", error);
    }
  };

  loadCurrentResume();


    }, []);

    const handleReanalyze = async () => {
  try {
    setReanalyzing(true);

    let resumeId = currentResume?._id;

    if (!resumeId) {
      const response = await getResumes();
      const latestResume = response.data.resumes?.[0];
      if (!latestResume?._id) {
        setReanalyzing(false);
        return;
      }
      resumeId = latestResume._id;
      setCurrentResume(latestResume);
    }

    const response = await reanalyzeResume(resumeId);
    setCurrentResume(response.data.resume);
  } catch (error) {
    console.error("Re-analyze error:", error);
  } finally {
    setReanalyzing(false);
  }
};

    return(
        <div className="min-h-screen bg-bg-[#F8F8FC]">
        <div className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-8">

      <div className="text-2xl font-bold text-[#1C1241]">
                         <button className="text-2xl text-[#1C1241]">
                        <FiMenu size={28} />
                          </button>
                        </div>

        <div className="flex items-center gap-6">
        <FiBell className="text-2xl text-gray-600" />

       <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600  ">
       <FaUser size={18}/>
       </div>    

       <div>
       <p className="font-bold text-sm">{user?.fullName || "User"}</p>

       {showEmail && (
              <p className="text-xs text-gray-500">{user?.email || "No email"}</p>
              )}
              </div> 

              
           <button
           onClick={() => setShowEmail(!showEmail)}
           className="text-gray-500 ml-1"
           > 
         <FiChevronDown
         className={`transition-transform duration-200 text-xl  ${
        showEmail ? "rotate-180" : ""
         }`}
         />
        </button>
        </div>
        </div>

      
       <div className=" flex items-center justify-between px-8 mt-1">
  <div>
    <h1 className="text-[15px] font-bold flex items-center gap-2">
      Original Resume
      <span className="text-[#6d35e8] text-2xl">✦</span>
    </h1>

    <p className="text-sm text-[#555579] mt-1">
      Open and review the original uploaded resume PDF for ATS analysis.
    </p>
  </div>

  <div className="flex items-center gap-[4px] mt-1">

  <button
  type="button"
  onClick={handleReanalyze}
  disabled={reanalyzing}
  className="h-9 px-5 rounded-md border border-[#a978ff] text-[#6830df] bg-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
>
  <FiRefreshCw
    className={reanalyzing ? "animate-spin" : ""}
  />

  {reanalyzing ? "Analyzing..." : "Re-analyze"}
</button>

  </div>
</div>


<div className="grid grid-cols-4 gap-1 px-8 mt-[2px]">

  <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 ">

   
      <FiTrendingUp className="text-2xl text-green-600 bg-green-50" />
    

    <div className="ml-4">
      <p className=" font-bold">
        ATS Score Original
      </p>

 <h2 className="text-xl font-bold mt-1">
    {currentResume?.analysisStatus === "completed"
  ? `${currentResume.atsScore}%`
  : "Analyzing..."}
</h2>

        <h2 className="text-sm font-bold  text-green-400">
              +10 points
            </h2>


    </div>
    </div>

<div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100">

   
      <FiEdit3 className="text-2xl text-purple-600" />
    

    <div className="ml-4">
      <p className=" font-bold">
        Changes Made
      </p>

      <h2 className="text-xl font-bold mt-1">
        28
      </h2>
      
        <h2 className="text-sm font-bold  text-purple-400">
              View all Changes
            </h2>


    </div>
    </div>

    <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100">

    
      <FiAlertTriangle className="text-2xl bg-red-50 text-red-500" />
    

    <div className="ml-4">
      <p className=" font-bold">
        ATS Score corrected
      </p>

<h2 className="text-xl font-bold mt-1">
  {currentResume?.correctedAtsScore
    ? `${currentResume.correctedAtsScore}%`
    : "Generating..."}
</h2>

        <h2 className="text-sm font-bold  text-gray-400">
              High Priority fixes
            </h2>
    </div>
    </div>

    <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100">

    <div className="rounded-xl text-green-600">
      <FiCheckCircle className="text-2xl bg-green-50" />
    </div>

    <div className="ml-4">
      <p className=" font-bold">
        Formatting Enhanced
      </p>

      <h2 className="text-xl font-bold mt-1">
        92
      </h2>

       <h2 className="text-sm font-bold  text-gray-400">
              High Priority fixes
            </h2>

    </div>
    </div>
</div>



          <div className="px-8 mt-5 ">
{currentResume && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-8 mt-2 bg-white">
    <div className="bg-white">
      <h2 className="font-bold mb-2">Original Resume</h2>
  
      <iframe
    src={`${backendUrl}${currentResume.filePath}#toolbar=0`}
    title="Original Resume"
    className="w-full h-[390px]"
  />
    </div>

  </div>
)}
  
</div>

        
        </div>
    )
}