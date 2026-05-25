import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { message } from "antd";
import UserContext from "./context/UserContext";
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
import PendingPointsApproval from "./components/PendingPointsApproval";
import PendingChanges from "./components/PendingChanges";
import ProtectedRoute from "./components/ProtectedRoute";
import AssignRolesAndNations from "./components/AssignRolesAndNations";
import PendingAdjustmentsApproval from "./components/PendingAdjustmentsApproval";
import ApproveNationChanges from "./components/ApproveNationChanges";
import ActivityLog from "./components/ActivityLog";
import UploadLogo from "./components/UploadLogo";
import UploadFavicon from "./components/UploadFavicon";
import UploadBackground from "./components/UploadBackground";
import ThemeToggle from "./components/ThemeToggle";
import ManageSocialMedia from "./components/ManageSocialMedia";

import { useEffect } from "react";
import "./App.css";
import "./styles/theme.css";

function App() {
  const location = useLocation();

  // Show only ForgotPassword or Login as standalone views
  const isStandalonePage = location.pathname === "/" || location.pathname === "/forgot-password";

  const [user, setUser] = useState(null);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [pageIcon, setPageIcon] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Apply saved theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, []);

  // Configure message to always appear at the top consistently
  message.config({
    top: 80,
    duration: 3,
    maxCount: 3,
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {isStandalonePage ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : (
        <>
          <Header
            toggleSidebar={toggleSidebar}
            pageTitle={pageTitle}
            pageIcon={pageIcon}
          />
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
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/province"
                  element={<ProtectedRoute><h2>Province Page</h2></ProtectedRoute>}
                />
                <Route
                  path="/region"
                  element={<ProtectedRoute><h2>Region Page</h2></ProtectedRoute>}
                />
                <Route
                  path="/branch"
                  element={<ProtectedRoute><h2>Branch Page</h2></ProtectedRoute>}
                />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/add-member" element={<ProtectedRoute><AddMember /></ProtectedRoute>} />
                <Route path="/add-mentor" element={<ProtectedRoute><AddMentor /></ProtectedRoute>} />
                <Route path="/school" element={<ProtectedRoute><School /></ProtectedRoute>} />
                <Route path="/points" element={<ProtectedRoute><Points /></ProtectedRoute>} />
                <Route path="/nation-points-2" element={<ProtectedRoute><NationPoints /></ProtectedRoute>} />
                <Route path="/nation-points" element={<ProtectedRoute><NationPerformance /></ProtectedRoute>} />
                <Route path="/pie-chart" element={<ProtectedRoute><PieChartPage /></ProtectedRoute>} />
                <Route path="/bar-chart" element={<ProtectedRoute><BarChartPage /></ProtectedRoute>} />
                <Route path="/line-chart" element={<ProtectedRoute><LineChartPage /></ProtectedRoute>} />
                <Route path="/add-secretary" element={<ProtectedRoute><AddSecretary /></ProtectedRoute>} />
                <Route path="/view-members" element={<ProtectedRoute><ViewMembers /></ProtectedRoute>} />
                <Route path="/view-mentors" element={<ProtectedRoute><ViewMentors /></ProtectedRoute>} />
                <Route path="/view-all-members" element={<ProtectedRoute><ViewAllMembers /></ProtectedRoute>} />
                <Route path="/view-events" element={<ProtectedRoute><h2>View Events</h2></ProtectedRoute>} />
                <Route path="/add-event" element={<ProtectedRoute><h2>Add Event</h2></ProtectedRoute>} />
                <Route path="/add-user-branch" element={<ProtectedRoute><AddUserBranch /></ProtectedRoute>} />
                <Route path="/event-management" element={<ProtectedRoute><BaseEventManager /></ProtectedRoute>} />
                <Route path="/management-church-address" element={<ProtectedRoute><ManageChurchAddresses /></ProtectedRoute>} />
                <Route path="/manage-nations" element={<ProtectedRoute><ManageNations /></ProtectedRoute>} />
                <Route path="/capture-points" element={<ProtectedRoute><Points /></ProtectedRoute>} />
                <Route path="/add-subtract" element={<ProtectedRoute><AdjustNationPoints /></ProtectedRoute>} />
                <Route path="/nation-performance-overview" element={<ProtectedRoute><NationPerformanceOverview /></ProtectedRoute>} />
                <Route path="/setting-nations" element={<ProtectedRoute><SettingNations /></ProtectedRoute>} />
                <Route path="/pending-approvals" element={<ProtectedRoute><PendingPointsApproval /></ProtectedRoute>} />
                <Route path="/pending-changes" element={<ProtectedRoute><PendingChanges /></ProtectedRoute>} />
                <Route path="/assign-roles-nations" element={<ProtectedRoute><AssignRolesAndNations /></ProtectedRoute>} />
                <Route path="/pending-adjustment-approvals" element={<ProtectedRoute><PendingAdjustmentsApproval /></ProtectedRoute>} />
                <Route path="/approve-nation-changes" element={<ProtectedRoute><ApproveNationChanges /></ProtectedRoute>} />
                <Route path="/active-logs" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
                <Route path="/upload-logo" element={<ProtectedRoute><UploadLogo /></ProtectedRoute>} />
                <Route path="/upload-favicon" element={<ProtectedRoute><UploadFavicon /></ProtectedRoute>} />
                <Route path="/upload-background" element={<ProtectedRoute><UploadBackground /></ProtectedRoute>} />
                <Route path="/theme-toggle" element={<ProtectedRoute><ThemeToggle /></ProtectedRoute>} />
                <Route path="/manage-social-media" element={<ProtectedRoute><ManageSocialMedia /></ProtectedRoute>} />

                

              </Routes>
              <Footer />
            </div>
          </div>
        </>
      )}
    </UserContext.Provider>
  );
}

export default App;
