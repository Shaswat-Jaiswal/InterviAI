import {
  FiFileText,
  FiTrendingUp,
  FiMic,
  FiAward,
  FiUploadCloud,
  FiPlayCircle,
  FiBarChart2,
  FiBookOpen,
  FiBell,
  FiChevronDown,
  FiMenu,
  FiEye,
} from "react-icons/fi";


import { FaUser } from "react-icons/fa";
import { useEffect, useState } from "react";
import { uploadResume, getResumes, getMonthlyResumeCount, } from "../../api/authApi";

const ScoreBar = ({ title, score, width, color }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm font-semibold">{score}</span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width }}
        ></div>
      </div>
    </div>
  );
};




const QuickAction = ({ icon, title, subtitle, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 text-left border border-gray-100 rounded-xl hover:bg-purple-50 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="font-semibold text-sm text-[#181433]">
          {title}
        </p>

        <p className="text-xs text-gray-500">
          {subtitle}
        </p>
      </div>
    </button>
  );
};

export const Dashboard = () => {
  const[user, setUser] = useState(null);
  const[showEmail, setShowEmail] = useState(false);
 const [resumes, setResumes] = useState([]);
const [uploading, setUploading] = useState(false);
const [fileInputKey, setFileInputKey] = useState(Date.now());
const latestResume = resumes[0];
const breakdown = latestResume?.atsBreakdown || {};
const [monthlyResumeCount, setMonthlyResumeCount] = useState(0);

useEffect(() => {
  const loadMonthlyCount = async () => {
    try {
      const response = await getMonthlyResumeCount();
      setMonthlyResumeCount(response.data.count || 0);
    } catch (error) {
      console.error("Monthly resume count error:", error);
    }
  };

  loadMonthlyCount();
}, []);

 useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  setUser(storedUser);

  const loadResumes = async () => {
    try {
      const response = await getResumes();
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error("Resume list load error:", error);
    }
  };

  loadResumes();
}, []);


const handleResumeUpload = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Sirf PDF file upload karein.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("File size 5MB se kam honi chahiye.");
    return;
  }

  try {
    setUploading(true);

    const response = await uploadResume(file);

    setResumes((previousResumes) => [
      response.data.resume,
      ...previousResumes,
    ]);

    alert("Resume successfully upload ho gaya.");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Resume upload nahi ho saka."
    );
  } finally {
    setUploading(false);
    setFileInputKey(Date.now());
  }
};

const openFilePicker = () => {
  document.getElementById("resume-upload-input")?.click();
};

const bestResume = resumes
  .filter((resume) => resume.analysisStatus === "completed")
  .reduce(
    (best, resume) =>
      !best || resume.atsScore > best.atsScore ? resume : best,
    null
  );

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
                
          
             <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
           <FaUser size={18} />
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

     <div className="px-8">
       <h1 className="font-bold text-xl text-[#181433]"> Welcome back, {user?.fullName?.split(" ")[0] || "User"}! 👋</h1>

       <p className="mt-2 text-gray-500 font-semibold">
            Here's your progress overview and recent activity
          </p>
         </div>

          <div className="grid grid-cols-4 gap-10 px-8 mt-2">
         
         {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="flex">
             
             <div className=" rounded-xl bg-purple-100  mt-[22px] ">
                <FiFileText className="text-4xl text-purple-600" />
              </div>

               <p className=" tex-xl px-5 py-4 font-bold">
              Resumes Analyzed
            </p>

             </div>

          <h2 className="text-2xl font-bold mt-[-18px] px-13">
             {monthlyResumeCount}
            </h2>

             <p className="text-sm font-bold text-gray-400 mt-1 px-13">
              This Month
            </p>
           </div>


           {/*Card2*/}

           <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="flex">

              <div className=" rounded-xl bg-purple-100  mt-[22px] ">
                <FiTrendingUp className="text-4xl text-green-600" />
              </div>

            <p className=" tex-xl px-5 py-4 font-bold">
              Average ATS Score
            </p>
             </div>

            <h2 className="text-2xl font-bold mt-[-18px] px-13">
              70
            </h2>

            <p className="text-sm font-bold text-gray-400 mt-1 px-13">
              +12% vs Last Month
            </p>
          </div> 

             
               {/*Card3*/}

           <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="flex">

              <div className=" rounded-xl bg-purple-100  mt-[22px] ">
                <FiMic className="text-4xl text-blue-600" />
              </div>

           

            <p className=" tex-xl px-5 py-4 font-bold">
              Mock Interviews
            </p>
             </div>

            <h2 className="text-2xl font-bold mt-[-18px] px-13">
              5
            </h2>

            <p className="text-sm font-bold text-gray-400 mt-1 px-13">
             This Month
            </p>
          </div> 

          {/*Card4*/}

           <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            <div className="flex">

              <div className=" rounded-xl bg-purple-100  mt-[22px] ">
                <FiAward className="text-4xl text-orange-600" />
              </div>

          
            <p className=" tex-xl px-5 py-4 font-bold">
              Best Score
            </p>
             </div>

            <h2 className="text-2xl font-bold mt-[-18px] px-13">
           {bestResume?.atsScore ?? 0}%
            </h2>

            <p className="text-sm font-bold text-gray-400 mt-1 px-13">
            Overall
            </p>
          </div> 

         </div>


           <div className="grid grid-cols-2 gap-5 mt-2 px-8">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

    <div className="flex justify-between items-center mb-4">
      <h2 className="font-bold text-[#181433]">
        Recent Resume Analysis
      </h2>

      <button className="text-purple-600 font-semibold">
        View All
      </button>
    </div>

      {/* Table Header */}
    <div className="grid grid-cols-4 items-center px-2 py-3 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500">
      <span>Resume Name</span>
      <span className="text-center">ATS Score</span>
      <span className="text-center">Date</span>
      <span className="text-right">Action</span>
    </div>

  {/* Resume Row */}
     {resumes.length === 0 ? (
  <div className="py-8 text-center text-gray-500 text-sm">
    Please upload your resume.
  </div>
) : (
  resumes.slice(0, 4).map((resume) => (
    <div
      key={resume._id}
      className="grid grid-cols-4 items-center px-2 py-4 border-b"
    >
      {/* Resume Name */}
      <div className="flex items-center gap-2 min-w-0">
        <FiFileText className="text-red-500 shrink-0" />

        <span
          className="font-medium text-sm truncate"
          title={resume.fileName}
        >
          {resume.fileName}
        </span>
      </div>

      {/* ATS Score: same as before */}
      <div className="text-center">
        <span className="font-bold text-green-500 text-sm">
          <span className="font-bold text-green-500 text-sm">
  {resume.analysisStatus === "completed"
    ? `${resume.atsScore ?? 0}%`
    : "Analyzing..."}
</span>
        </span>
      </div>

      {/* Upload Date */}
      <div className="text-center">
        <span className="text-gray-500 text-sm">
          {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Open Resume */}
      <div className="text-right">
        <a
          href={`http://localhost:5001${resume.filePath}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-purple-600 hover:text-purple-800"
          title="View resume"
        >
          <FiEye size={18} />
        </a>
      </div>
    </div>
  ))
)}
 <input
  id="resume-upload-input"
  key={fileInputKey}
  type="file"
  accept="application/pdf"
  onChange={handleResumeUpload}
  className="hidden"
/>

<button
  type="button"
  onClick={openFilePicker}
  disabled={uploading}
  className="w-full mt-2 border border-purple-200 bg-purple-50 text-purple-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 disabled:opacity-60"
>
  <FiUploadCloud size={18} />

  <span>
    {uploading ? "Uploading..." : "Upload New Resume"}
  </span>
</button>
    </div>


<div className="flex flex-col gap-1">

    {/* Score Breakdown */}
    <div className="bg-white rounded-2xl h-[200px] shadow-sm border border-gray-100">

      <h2 className="text-lg px-2 py-1 font-bold text-[#181433]">
        Score Breakdown
      </h2>

      <div className="flex items-center gap-8 ">

        <div className="w-33 h-33 rounded-full border-[15px] border-purple-500 flex items-center justify-center">

          <div className="text-center">
           <p className="text-3xl font-bold">
  {latestResume?.atsScore ?? 0}%
</p>

            <p className="text-xs text-gray-500">
              Overall
            </p>
          </div>

        </div>

        
        <div className="flex-1 ">

               <ScoreBar
  title="Content"
  score={`${breakdown.content ?? 0}%`}
  width={`${breakdown.content ?? 0}%`}
  color="bg-purple-500"
/>

<ScoreBar
  title="Skills"
  score={`${breakdown.skills ?? 0}%`}
  width={`${breakdown.skills ?? 0}%`}
  color="bg-green-500"
/>

<ScoreBar
  title="Experience"
  score={`${breakdown.experience ?? 0}%`}
  width={`${breakdown.experience ?? 0}%`}
  color="bg-blue-500"
/>

<ScoreBar
  title="Projects"
  score={`${breakdown.projects ?? 0}%`}
  width={`${breakdown.projects ?? 0}%`}
  color="bg-orange-400"
/>

<ScoreBar
  title="Formatting"
  score={`${breakdown.formatting ?? 0}%`}
  width={`${breakdown.formatting ?? 0}%`}
  color="bg-pink-400"
/>

                  </div>


      </div>

    </div>

    {/* Quick Actions */}
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

      <h2 className="text-lg font-bold text-[#181433]">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4 mt-5">

       <QuickAction
  icon={<FiUploadCloud />}
  title="Upload Resume"
  subtitle="Analyze your resume"
  onClick={openFilePicker}
/>

        <QuickAction
          icon={<FiPlayCircle />}
          title="Start Mock Interview"
          subtitle="Practice your skills"
        />

        <QuickAction
          icon={<FiBarChart2 />}
          title="View Progress"
          subtitle="Track your journey"
        />

        <QuickAction
          icon={<FiBookOpen />}
          title="Browse Questions"
          subtitle="Explore interview questions"
        />

      </div>

    </div>

  </div>

</div>
   
             
              


           </div>
  )
}