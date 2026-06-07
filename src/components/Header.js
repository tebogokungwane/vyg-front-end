import React, { useContext, useEffect, useState } from "react";
import { Button } from "antd";
import { MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import fallbackImage from "../images/vyg.jpg";
import UserContext from "../context/UserContext";
import "../styles/Header.css";

const LOGO_URL = `${process.env.REACT_APP_API_BASE_URL}/api/branding/logo`;

const Header = ({ toggleSidebar, pageTitle, pageIcon }) => {
  const { user, setUser } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [logoSrc, setLogoSrc] = useState(fallbackImage);
  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = `${LOGO_URL}?t=${Date.now()}`;
    img.onload = () => setLogoSrc(img.src);
    img.onerror = () => setLogoSrc(fallbackImage);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-left">
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
        {/* Logout icon button - big screen only */}
        {!isMobile && user && (
          <Button
            type="text"
            icon={<LogoutOutlined style={{ color: "#cc0000", fontSize: 20 }} />}
            onClick={handleLogout}
            style={{ marginRight: 50 }}
          />
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
