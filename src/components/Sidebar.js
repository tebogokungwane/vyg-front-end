import React, { useState, useEffect, useContext } from "react";
import { Menu, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  EyeOutlined,
  UserOutlined,
  SettingOutlined,
  StarOutlined,
  EnvironmentOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  BookOutlined,
  ClockCircleOutlined,
  ProfileOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  PictureOutlined,
  LogoutOutlined,
  RadarChartOutlined,
  BankOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import UserContext from "../context/UserContext";
import "../styles/Sidebar.css";

const Sidebar = ({ isSidebarOpen, toggleSidebar, setPageTitle, setPageIcon, user }) => {
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [openKeys, setOpenKeys] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rootSubmenuKeys = ["points", "charts", "member", "settings", "upload-images", "schools"];

  const allMenuItems = [
    { key: "dashboard", icon: <HomeOutlined style={{ color: "#1890ff" }} />, label: "Dashboard" },
    {
      key: "points",
      icon: <StarOutlined style={{ color: "#faad14" }} />,
      label: "Points",
      children: [
        { key: "capture-points", icon: <StarOutlined style={{ color: "#faad14" }} />, label: "Capture Points" },
        { key: "add-subtract", icon: <EnvironmentOutlined style={{ color: "#eb2f96" }} />, label: "Add or Subtract Points" },
        { key: "pending-approvals", icon: <ClockCircleOutlined style={{ color: "#fa8c16" }} />, label: "Pending Points Approval" },
        { key: "pending-adjustment-approvals", icon: <ClockCircleOutlined style={{ color: "#fa541c" }} />, label: "Adjustment Approval" },
      ],
    },
    { key: "nation-points", icon: <AppstoreOutlined style={{ color: "#722ed1" }} />, label: "Nations Standings" },
    { key: "nation-performance-overview", icon: <LineChartOutlined style={{ color: "#13c2c2" }} />, label: "Performance Overview" },
    { key: "charts", icon: <BarChartOutlined style={{ color: "#52c41a" }} />, label: "Analytics" },
    {
      key: "member",
      icon: <TeamOutlined style={{ color: "#2f54eb" }} />,
      label: "Member",
      children: [
        { key: "add-mentor", icon: <TeamOutlined style={{ color: "#2f54eb" }} />, label: "Add User" },
        { key: "view-all-members", icon: <EyeOutlined style={{ color: "#13c2c2" }} />, label: "View All Member" },
        { key: "view-members", icon: <EyeOutlined style={{ color: "#722ed1" }} />, label: "View Members" },
        { key: "member-hierarchy", icon: <TeamOutlined style={{ color: "#fa8c16" }} />, label: "Team Structure" },
        { key: "nearby-members", icon: <RadarChartOutlined style={{ color: "#52c41a" }} />, label: "Nearby Members" },
      ],
    },
    {
      key: "schools",
      icon: <BookOutlined style={{ color: "#fa8c16" }} />,
      label: "Schools",
      children: [
        { key: "school", icon: <BookOutlined style={{ color: "#fa8c16" }} />, label: "School Info" },
        { key: "school-institutions", icon: <BankOutlined style={{ color: "#13c2c2" }} />, label: "All Institutions" },
        { key: "school-institutions/add", icon: <PlusCircleOutlined style={{ color: "#52c41a" }} />, label: "Add School" },
        { key: "school-stats", icon: <PieChartOutlined style={{ color: "#722ed1" }} />, label: "School Stats" },
        { key: "learners", icon: <TeamOutlined style={{ color: "#2f54eb" }} />, label: "Learners" },
        { key: "learners/add", icon: <PlusCircleOutlined style={{ color: "#52c41a" }} />, label: "Add Learner" },
      ],
    },
    { key: "projects", icon: <AppstoreOutlined style={{ color: "#13c2c2" }} />, label: "Projects" },
    { key: "profile", icon: <ProfileOutlined style={{ color: "#597ef7" }} />, label: "Profile" },
    {
      key: "upload-images",
      icon: <PictureOutlined style={{ color: "#eb2f96" }} />,
      label: "Image Management",
      children: [
        { key: "upload-logo", icon: <PictureOutlined style={{ color: "#eb2f96" }} />, label: "Upload Logo" },
        { key: "upload-favicon", icon: <PictureOutlined style={{ color: "#fa541c" }} />, label: "Upload Favicon" },
        { key: "upload-background", icon: <PictureOutlined style={{ color: "#722ed1" }} />, label: "Upload Background" },
        { key: "manage-social-media", icon: <AppstoreOutlined style={{ color: "#1890ff" }} />, label: "Social Media" },
      ],
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ color: "#595959" }} />,
      label: "Settings",
      children: [
        { key: "add-user-branch", icon: <UserOutlined style={{ color: "#1890ff" }} />, label: "Add User for branch" },
        { key: "event-management", icon: <StarOutlined style={{ color: "#faad14" }} />, label: "Event Management" },
        { key: "management-church-address", icon: <EnvironmentOutlined style={{ color: "#52c41a" }} />, label: "Manage Church Address" },
        { key: "setting-nations", icon: <AppstoreOutlined style={{ color: "#722ed1" }} />, label: "Manage Nation" },
        { key: "manage-projects", icon: <AppstoreOutlined style={{ color: "#13c2c2" }} />, label: "Manage Projects" },
        { key: "theme-toggle", icon: <SettingOutlined style={{ color: "#faad14" }} />, label: "Light / Dark Mode" },
        { key: "active-logs", icon: <DatabaseOutlined style={{ color: "#13c2c2" }} />, label: "Active Logs" },
      ],
    },
  ];

  // Allowed items for "member" role
  const allowedKeysForMember = [
    "dashboard",
    "charts",
    "nation-points",
    "nation-performance-overview",
    "profile",
    "pie-chart",
    "bar-chart",
    "line-chart"
  ];



  const getFilteredMenuItems = () => {

    if (!user) return allMenuItems;

    if (user?.role?.toLowerCase() === "member") {
      return allMenuItems.filter(item =>
        ["dashboard", "charts", "nation-points", "nation-performance-overview", "profile", "projects"].includes(item.key)
      );
    }

    if (user?.role === "member") {
      const allowedKeysForMember = [
        "dashboard",
        "charts",
        "nation-points",
        "nation-performance-overview",
        "profile",
        "pie-chart",
        "bar-chart",
        "line-chart",
      ];
  
      const filtered = allMenuItems
        .map(item => {
          if (item.children) {
            const filteredChildren = item.children.filter(child =>
              allowedKeysForMember.includes(child.key)
            );
            if (filteredChildren.length > 0 || allowedKeysForMember.includes(item.key)) {
              return {
                ...item,
                children: filteredChildren
              };
            }
            return null;
          } else {
            return allowedKeysForMember.includes(item.key) ? item : null;
          }
        })
        .filter(Boolean);
  
      return filtered;
    }
  
    return allMenuItems;
  };
  

  const menuItems = getFilteredMenuItems();

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };

  const handleMenuClick = ({ key }) => {
    const selectedItem = menuItems
      .flatMap((item) => item.children || item)
      .find((item) => item.key === key);
    setSelectedMenu(key);
    setPageTitle(selectedItem?.label || key);
    setPageIcon(selectedItem?.icon || null);
    navigate(`/${key}`);

    if (isMobile) toggleSidebar();
  };

  return (
    <div className={`sidebar ${isSidebarOpen || !isMobile ? "open" : "closed"}`}>
      <Menu
        mode="inline"
        selectedKeys={[selectedMenu]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={menuItems}
      />

      {isMobile && user && (
        <div className="mobile-user-info">
          <div className="user-name">
            {user.name} {user.surname}
          </div>
        </div>
      )}

      {isMobile && user && (
        <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0" }}>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            style={{ textAlign: "left", height: 40, fontWeight: 500 }}
          >
            Logout
          </Button>
        </div>
      )}

      {!isMobile && user && (
        <div className="sidebar-user-info">
          <span style={{ fontSize: 13, color: "#595959" }}>
            Logged in as: <strong>{user.name} {user.surname}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
