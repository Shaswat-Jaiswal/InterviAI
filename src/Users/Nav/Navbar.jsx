import { useNavigate } from "react-router-dom";

export const Navbar = () => {
    const navigate = useNavigate();

const menuItems = [ 
    {name: "Home", path: "/"},
    {name: "About Us"},
    {name: "Features", path: "/dashboard"},
    {name: "Pricing"},
]

    return(
     <div className="flex  gap-[700px] bg-purple-950 px-6 py-3">

        <div className="flex ml-[10px] gap-[10px]">
       
       <img
       src="/interview/Logo.jpeg"
       alt="logo"
       className="w-[35px] h-[35px] object-contain"
       />
       <span className="text-2xl font-bold text-white">
  InterviAI
</span>
        </div>

        <div className="flex items-center font-bold gap-8 text-white ">
         {menuItems.map((item) => (
  <button
    key={item.name}
    onClick={() => {
      if (item.path) navigate(item.path);
    }}
  >
    {item.name}
  </button>
))}

<button
onClick={() => {
  navigate("/login");
}}
className="border border-white px-5 py-2 rounded-lg"
>
  Login
</button>
        </div>

     </div>
    )
}