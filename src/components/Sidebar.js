import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  EyeOutlined,
  UserOutlined,
  SettingOutlined,
  PlusOutlined,
  StarOutlined,
  EnvironmentOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  BookOutlined,
  ProfileOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import "../styles/Sidebar.css";

const Sidebar = ({ isSidebarOpen, toggleSidebar, setPageTitle, setPageIcon, user }) => {
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [openKeys, setOpenKeys] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("User in Sidebar:", user);
    console.log("Sidebar isMobile:", isMobile);
  }, [user, isMobile]);

  const rootSubmenuKeys = ["points", "charts", "member", "settings"];

  const menuItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Dashboard" },
    {
      key: "points",
      icon: <StarOutlined />,
      label: "Points",
      children: [
        { key: "capture-points", icon: <StarOutlined />, label: "Capture Points" },
        { key: "add-subtract", icon: <EnvironmentOutlined />, label: "Add or Subtract Points" },
      ],
    },
    { key: "nation-points", icon: <AppstoreOutlined />, label: "NationPoints" },
    { key: "nation-performance-overview", icon: <LineChartOutlined />, label: "Performance Overview" },
    {
      key: "charts",
      icon: <BarChartOutlined />,
      label: "Charts",
      children: [
        { key: "pie-chart", icon: <PieChartOutlined />, label: "Pie Chart" },
        { key: "bar-chart", icon: <BarChartOutlined />, label: "Bar Chart" },
        { key: "line-chart", icon: <LineChartOutlined />, label: "Line Chart" },
      ],
    },
    {
      key: "member",
      icon: <TeamOutlined />,
      label: "Member",
      children: [
        { key: "add-member", icon: <PlusOutlined />, label: "Add Member" },
        { key: "add-mentor", icon: <TeamOutlined />, label: "Add Mentor" },
        { key: "view-all-members", icon: <EyeOutlined />, label: "View All Member" },
        { key: "view-mentors", icon: <EyeOutlined />, label: "View Mentors" },
        { key: "view-members", icon: <EyeOutlined />, label: "View Members" },
      ],
    },
    { key: "school", icon: <BookOutlined />, label: "School" },
    { key: "profile", icon: <ProfileOutlined />, label: "Profile" },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        { key: "add-user-branch", icon: <UserOutlined />, label: "Add User for branch" },
        { key: "event-management", icon: <StarOutlined />, label: "Event Management" },
        { key: "management-church-address", icon: <EnvironmentOutlined />, label: "Manage Church Address" },
        { key: "setting-nations", icon: <AppstoreOutlined />, label: "Manage Nation" },
      ],
    },
  ];

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };

  const handleMenuClick = ({ key }) => {
    const selectedItem = menuItems.flatMap((item) => item.children || item).find((item) => item.key === key);
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
    </div>
  );
};

export default Sidebar;
