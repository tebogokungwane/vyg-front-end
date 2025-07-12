import React, { useState, useEffect } from "react";
import { Menu } from "antd";
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
} from "@ant-design/icons";
import "../styles/Sidebar.css";

const Sidebar = ({ isSidebarOpen, toggleSidebar, setPageTitle, setPageIcon, user }) => {
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [openKeys, setOpenKeys] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {

    console.log("🧾 Sidebar: Rendering menu for user role:", user?.role);


    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rootSubmenuKeys = ["points", "charts", "member", "settings"];

  const allMenuItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Dashboard" },
    {
      key: "points",
      icon: <StarOutlined />,
      label: "Points",
      children: [
        { key: "capture-points", icon: <StarOutlined />, label: "Capture Points" },
        { key: "add-subtract", icon: <EnvironmentOutlined />, label: "Add or Subtract Points" },
        { key: "pending-approvals", icon: <ClockCircleOutlined />, label: "Pending Points Approval" },
        { key: "pending-adjustment-approvals", icon: <ClockCircleOutlined />, label: "Adjustment Approval" },
      ],
    },
    { key: "nation-points", icon: <AppstoreOutlined />, label: "Nations Standings" },
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
        { key: "add-mentor", icon: <TeamOutlined />, label: "Add User" },
        { key: "view-all-members", icon: <EyeOutlined />, label: "View All Member" },
        { key: "view-mentors", icon: <EyeOutlined />, label: "View Mentors" },
        // { key: "assign-roles-nations", icon: <TeamOutlined />, label: "Assign Roles & Nations" },
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
        { key: "active-logs", icon: <DatabaseOutlined />, label: "Active Logs" }



        // { key: "approve-nation-changes", icon: <ClockCircleOutlined />, label: "Approve Nation" },

        // { key: "approvals", icon: <ClockCircleOutlined />, label: "Pending approval" },
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

    if (user?.role?.toLowerCase() === "member") {
  console.log("🔒 Filtering menu for MEMBER role");
  return allMenuItems.filter(item =>
    ["dashboard", "charts", "nation-points", "nation-performance-overview", "profile"].includes(item.key)
  );
}

  


    console.log("🧾 Sidebar: Rendering menu for user role:", user.role);
  
    if (user.role === "member") {
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
  
      console.log("🎯 Filtered menu for 'member':", filtered.map(i => i.key));
      return filtered;
    }
  
    console.log("✅ Showing full menu for role:", user.role);
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
    </div>
  );
};

export default Sidebar;
