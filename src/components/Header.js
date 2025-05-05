import React, { useContext, useEffect, useState } from "react";
import { Button } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import profileImage from "../images/vyg.jpg";
import UserContext from "../context/UserContext";
import "../styles/Header.css";

const Header = ({ toggleSidebar, pageTitle, pageIcon }) => {
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        {/* On large screens, show logo; on mobile, show hamburger menu */}
        {!isMobile && <img src={profileImage} alt="Logo" className="logo" />}
        {isMobile && (
          <Button
            className="hamburger-menu"
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={toggleSidebar}
          />
        )}
      </div>

      <div className="header-center">
        <h1 className="app-name">
          {pageIcon && <span className="page-icon">{pageIcon}</span>}
          {pageTitle}
        </h1>
      </div>

      <div className="header-right">
        {/* Large screen: Show name */}
        {!isMobile && user && (
          <span className="user-name">
            {user.name} {user.surname}
          </span>
        )}

        {/* Small screen: Show logo on the right */}
        {isMobile && (
          <img src={profileImage} alt="Logo" className="mobile-logo" />
        )}
      </div>
    </header>
  );
};

export default Header;
