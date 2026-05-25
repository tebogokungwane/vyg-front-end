import React, { useContext, useEffect, useState } from "react";
import { Button } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import fallbackImage from "../images/vyg.jpg";
import UserContext from "../context/UserContext";
import "../styles/Header.css";

const LOGO_URL = `${process.env.REACT_APP_API_BASE_URL}/api/branding/logo`;

const Header = ({ toggleSidebar, pageTitle, pageIcon }) => {
  const { user } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [logoSrc, setLogoSrc] = useState(fallbackImage);

  useEffect(() => {
    // Fetch logo from the database via the branding API
    const img = new Image();
    img.src = `${LOGO_URL}?t=${Date.now()}`;
    img.onload = () => setLogoSrc(img.src);
    img.onerror = () => setLogoSrc(fallbackImage); // fallback if no logo in DB yet
  }, []);

  // Listen for custom event dispatched when logo is uploaded
  useEffect(() => {
    const handleLogoUpdate = () => {
      setLogoSrc(`${LOGO_URL}?t=${Date.now()}`);
    };
    window.addEventListener("logo-updated", handleLogoUpdate);
    return () => window.removeEventListener("logo-updated", handleLogoUpdate);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        {/* On large screens, show logo; on mobile, show hamburger menu */}
        {!isMobile && <img src={logoSrc} alt="Logo" className="logo" />}
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
          <img src={logoSrc} alt="Logo" className="mobile-logo" />
        )}
      </div>
    </header>
  );
};

export default Header;
