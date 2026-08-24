import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./Users/Home/Home.jsx";
import { Login } from "./Users/Login/Login.jsx"
import { Signin } from "./Users/Signin/Signin.jsx"
import { SidebarLayout } from "./Users/SidebarLayout/SidebarLayout.jsx";

import { Dashboard } from "./Users/Dashbaord/Dashboard.jsx";
import { ResumeAnalyzer } from "./Users/ResumeAnalyzer/ResumeAnalyzer.jsx";


export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Signin />} />

          <Route element={<SidebarLayout />}>
          
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/resume" element={<ResumeAnalyzer/>}/>
          
          </Route>
      </Routes>
    </BrowserRouter>
  );
};