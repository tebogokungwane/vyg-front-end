import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import UserContext from "./context/UserContext";

// Components
import Dashboard from "./components/Dashboard";
import AddMember from "./components/AddMember";
import AddMentor from "./components/AddMentor";
import AddSecretary from "./components/AddSecretary";
import ViewMembers from "./components/ViewMembers";
import ViewMentors from "./components/ViewMentors";
import ViewAllMembers from "./components/ViewAllMembers";
import Profile from "./components/Profile";
import Header from "./components/Header";
import School from "./components/School";
import NationPerformance from "./components/NationPerformance";
import PieChartPage from "./components/PieChartPage";
import BarChartPage from "./components/BarChartPage";
import LineChartPage from "./components/LineChartPage";
import Points from "./components/Points";
import NationPoints from "./components/NationPoints";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import AdjustNationPoints from "./components/AdjustNationPoints";
import AddUserBranch from "./components/AddUserBranch";
import BaseEventManager from "./components/BaseEventManager";
import ManageChurchAddresses from "./components/ManageChurchAddresses";
import ManageNations from "./components/ManageNations";
import NationPerformanceOverview from "./components/NationPerformanceOverview";
import SettingNations from "./components/SettingNations";
import ForgotPassword from "./components/ForgotPassword";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  const [user, setUser] = useState(null);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [pageIcon, setPageIcon] = useState(null);

  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {!isLoginPage && (
        <>
          <Header
            toggleSidebar={toggleSidebar}
            pageTitle={pageTitle}
            pageIcon={pageIcon}
          />
          {/* The app-container wraps the sidebar and content */}
          <div className="app-container">
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              setPageTitle={setPageTitle}
              setPageIcon={setPageIcon}
              user={user}
            />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/province" element={<h2>Province Page</h2>} />
                <Route path="/region" element={<h2>Region Page</h2>} />
                <Route path="/branch" element={<h2>Branch Page</h2>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/add-member" element={<AddMember />} />
                <Route path="/add-mentor" element={<AddMentor />} />
                <Route path="/school" element={<School />} />
                <Route path="/points" element={<Points />} />
                <Route path="/nation-points-2" element={<NationPoints />} />
                <Route path="/nation-points" element={<NationPerformance />} />
                <Route path="/pie-chart" element={<PieChartPage />} />
                <Route path="/bar-chart" element={<BarChartPage />} />
                <Route path="/line-chart" element={<LineChartPage />} />
                <Route path="/add-secretary" element={<AddSecretary />} />
                <Route path="/view-members" element={<ViewMembers />} />
                <Route path="/view-mentors" element={<ViewMentors />} />
                <Route path="/view-all-members" element={<ViewAllMembers />} />
                <Route path="/view-events" element={<h2>View Events</h2>} />
                <Route path="/add-event" element={<h2>Add Event</h2>} />
                <Route path="/add-user-branch" element={<AddUserBranch />} />
                <Route path="/event-management" element={<BaseEventManager />} />
                <Route path="/management-church-address" element={<ManageChurchAddresses />} />
                <Route path="/manage-nations" element={<ManageNations />} />
                <Route path="/capture-points" element={<Points />} />
                <Route path="/add-subtract" element={<AdjustNationPoints />} />
                <Route path="/nation-performance-overview" element={<NationPerformanceOverview />} />
                <Route path="/setting-nations" element={<SettingNations />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />


              </Routes>
              <Footer />
            </div>
          </div>
        </>
      )}
      {isLoginPage && <Login />}
    </UserContext.Provider>
  );
}

export default App;
