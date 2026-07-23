import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { message } from "antd";
import UserContext from "./context/UserContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import VygLoader from "./components/VygLoader";
import axios from "./utils/axios";
import "./App.css";
import "./styles/theme.css";
import "./styles/pages.css";

// Lazy-loaded components — only fetched when navigated to
const Login = lazy(() => import("./components/Login"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AddMember = lazy(() => import("./components/AddMember"));
const AddMentor = lazy(() => import("./components/AddMentor"));
const AddSecretary = lazy(() => import("./components/AddSecretary"));
const ViewMembers = lazy(() => import("./components/ViewMembers"));
const ViewMentors = lazy(() => import("./components/ViewMentors"));
const ViewAllMembers = lazy(() => import("./components/ViewAllMembers"));
const Profile = lazy(() => import("./components/Profile"));
const School = lazy(() => import("./components/School"));
const NationPerformance = lazy(() => import("./components/NationPerformance"));
const PieChartPage = lazy(() => import("./components/PieChartPage"));
const BarChartPage = lazy(() => import("./components/BarChartPage"));
const LineChartPage = lazy(() => import("./components/LineChartPage"));
const Points = lazy(() => import("./components/Points"));
const NationPoints = lazy(() => import("./components/NationPoints"));
const AdjustNationPoints = lazy(() => import("./components/AdjustNationPoints"));
const AddUserBranch = lazy(() => import("./components/AddUserBranch"));
const BaseEventManager = lazy(() => import("./components/BaseEventManager"));
const ManageChurchAddresses = lazy(() => import("./components/ManageChurchAddresses"));
const ManageNations = lazy(() => import("./components/ManageNations"));
const NationPerformanceOverview = lazy(() => import("./components/NationPerformanceOverview"));
const SettingNations = lazy(() => import("./components/SettingNations"));
const PendingPointsApproval = lazy(() => import("./components/PendingPointsApproval"));
const PendingChanges = lazy(() => import("./components/PendingChanges"));
const AssignRolesAndNations = lazy(() => import("./components/AssignRolesAndNations"));
const PendingAdjustmentsApproval = lazy(() => import("./components/PendingAdjustmentsApproval"));
const ApproveNationChanges = lazy(() => import("./components/ApproveNationChanges"));
const ActivityLog = lazy(() => import("./components/ActivityLog"));
const UploadLogo = lazy(() => import("./components/UploadLogo"));
const UploadFavicon = lazy(() => import("./components/UploadFavicon"));
const UploadBackground = lazy(() => import("./components/UploadBackground"));
const ThemeToggle = lazy(() => import("./components/ThemeToggle"));
const ManageSocialMedia = lazy(() => import("./components/ManageSocialMedia"));
const Projects = lazy(() => import("./components/Projects"));
const ManageProjects = lazy(() => import("./components/ManageProjects"));
const MemberHierarchy = lazy(() => import("./components/MemberHierarchy"));
const Analytics = lazy(() => import("./components/Analytics"));
const NearbyMembers = lazy(() => import("./components/NearbyMembers"));
const SchoolInstitutions = lazy(() => import("./components/SchoolInstitutions"));
const SchoolInstitutionDetail = lazy(() => import("./components/SchoolInstitutionDetail"));
const SchoolInstitutionForm = lazy(() => import("./components/SchoolInstitutionForm"));
const SchoolInstitutionStats = lazy(() => import("./components/SchoolInstitutionStats"));
const LearnerList = lazy(() => import("./components/LearnerList"));
const LearnerDetail = lazy(() => import("./components/LearnerDetail"));
const LearnerForm = lazy(() => import("./components/LearnerForm"));

// Branded loading fallback with VYG logo animation
const PageLoader = () => <VygLoader />;

function App() {
  const location = useLocation();

  // Show only ForgotPassword or Login as standalone views
  const isStandalonePage = location.pathname === "/" || location.pathname === "/forgot-password";

  // Restore user from localStorage on mount (instant, no API call)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Also restore the auth header so API calls work immediately
        const token = parsed.token || localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem("user");
    }
    return null;
  });

  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [pageIcon, setPageIcon] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

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

  // Load background image for main content (without cache-busting for speed)
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    if (isStandalonePage) return; // Don't load bg on login page

    const loadBg = () => {
      const img = new Image();
      img.src = `${process.env.REACT_APP_API_BASE_URL}/api/branding/background`;
      img.onload = () => setBgImage(img.src);
      img.onerror = () => setBgImage(null);
    };
    loadBg();

    window.addEventListener("background-updated", loadBg);
    return () => window.removeEventListener("background-updated", loadBg);
  }, [isStandalonePage]);

  // Configure message to always appear at the top consistently
  message.config({
    top: 80,
    duration: 3,
    maxCount: 3,
  });

  const mainContentStyle = bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : {};

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Suspense fallback={<PageLoader />}>
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
              <div className="main-content" style={mainContentStyle}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/province" element={<ProtectedRoute><h2>Province Page</h2></ProtectedRoute>} />
                    <Route path="/region" element={<ProtectedRoute><h2>Region Page</h2></ProtectedRoute>} />
                    <Route path="/branch" element={<ProtectedRoute><h2>Branch Page</h2></ProtectedRoute>} />
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
                    <Route path="/charts" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/add-secretary" element={<ProtectedRoute><AddSecretary /></ProtectedRoute>} />
                    <Route path="/view-members" element={<ProtectedRoute><ViewMembers /></ProtectedRoute>} />
                    <Route path="/view-mentors" element={<ProtectedRoute><ViewMentors /></ProtectedRoute>} />
                    <Route path="/member-hierarchy" element={<ProtectedRoute><MemberHierarchy /></ProtectedRoute>} />
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
                    <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                    <Route path="/manage-projects" element={<ProtectedRoute><ManageProjects /></ProtectedRoute>} />
                    <Route path="/nearby-members" element={<ProtectedRoute><NearbyMembers /></ProtectedRoute>} />
                    <Route path="/school-institutions" element={<ProtectedRoute><SchoolInstitutions /></ProtectedRoute>} />
                    <Route path="/school-institutions/add" element={<ProtectedRoute><SchoolInstitutionForm /></ProtectedRoute>} />
                    <Route path="/school-institutions/edit/:id" element={<ProtectedRoute><SchoolInstitutionForm /></ProtectedRoute>} />
                    <Route path="/school-institutions/:id" element={<ProtectedRoute><SchoolInstitutionDetail /></ProtectedRoute>} />
                    <Route path="/school-stats" element={<ProtectedRoute><SchoolInstitutionStats /></ProtectedRoute>} />
                    <Route path="/learners" element={<ProtectedRoute><LearnerList /></ProtectedRoute>} />
                    <Route path="/learners/add" element={<ProtectedRoute><LearnerForm /></ProtectedRoute>} />
                    <Route path="/learners/edit/:id" element={<ProtectedRoute><LearnerForm /></ProtectedRoute>} />
                    <Route path="/learners/:id" element={<ProtectedRoute><LearnerDetail /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
                <Footer />
              </div>
            </div>
          </>
        )}
      </Suspense>
    </UserContext.Provider>
  );
}

export default App;
