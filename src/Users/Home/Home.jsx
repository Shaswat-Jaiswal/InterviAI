import { Navbar } from "../Nav/Navbar";
import { useNavigate } from "react-router-dom";


export const Home = () => {
    const navigate = useNavigate();
    
    return (
        <div>
            <Navbar />

            <div className="flex gap-[100px]">

                <div className="mt-[70px] ml-[150px]">
                    <span className="block text-5xl font-extrabold"> Elevate Your Interview</span>
                    <span className="block text-4xl font-extrabold"> Skills with AI</span>
                    <span className="block mt-[10px] font-bold text-xl">Your personalized AI-powerd paltform for realistic
                    mock</span>
                   <span className="block font-bold text-xl">interviews and real-time feedback</span>

                   <button
                   onClick={() => navigate("/dashboard")}
                   className="mt-[30px] border border-purple-500 bg-purple-700 
                   text-white px-3 py-3 font-bold rounded-lg text-xl"
                   >
                    Start Your free Trial
                   </button>
                </div>

                <div className="mt-[70px]">
                    <img
                    src="/interview/Home.jpeg"
                    alt="image"
                    />
                </div>

            </div>
        </div>
    )
}