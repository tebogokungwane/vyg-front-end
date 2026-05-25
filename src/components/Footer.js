import React, { useEffect, useState } from "react";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  LinkedinOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaPinterest,
  FaSnapchat,
  FaSpotify,
} from "react-icons/fa";
import axios from "../utils/axios";
import "./Footer.css";

const getPlatformIcon = (platform) => {
  const style = { fontSize: 22 };
  switch (platform) {
    case "facebook": return <FacebookOutlined style={{ ...style, color: "#1877f2" }} />;
    case "twitter": return <TwitterOutlined style={{ ...style, color: "#1da1f2" }} />;
    case "instagram": return <InstagramOutlined style={{ ...style, color: "#e1306c" }} />;
    case "tiktok": return <FaTiktok style={{ ...style, color: "#000" }} />;
    case "youtube": return <YoutubeOutlined style={{ ...style, color: "#ff0000" }} />;
    case "linkedin": return <LinkedinOutlined style={{ ...style, color: "#0077b5" }} />;
    case "whatsapp": return <FaWhatsapp style={{ ...style, color: "#25d366" }} />;
    case "telegram": return <FaTelegram style={{ ...style, color: "#0088cc" }} />;
    case "pinterest": return <FaPinterest style={{ ...style, color: "#e60023" }} />;
    case "snapchat": return <FaSnapchat style={{ ...style, color: "#fffc00" }} />;
    case "spotify": return <FaSpotify style={{ ...style, color: "#1db954" }} />;
    default: return <GlobalOutlined style={{ ...style, color: "#595959" }} />;
  }
};

// Fallback links if API is not available
const fallbackLinks = [
  { id: 1, platform: "facebook", url: "https://www.facebook.com/vygsa/", active: true },
  { id: 2, platform: "twitter", url: "https://twitter.com/OfficialVYG", active: true },
  { id: 3, platform: "instagram", url: "https://www.instagram.com/vygsa_official/", active: true },
  { id: 4, platform: "tiktok", url: "https://www.tiktok.com/search?q=vyg%20rsa%20group&t=1746140884456", active: true },
  { id: 5, platform: "youtube", url: "https://www.youtube.com/@vygsa_official", active: true },
];

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState(fallbackLinks);

  const fetchSocialLinks = async () => {
    try {
      const res = await axios.get("/api/social-media");
      if (res.data && res.data.length > 0) {
        setSocialLinks(res.data.filter((link) => link.active !== false));
      }
    } catch (error) {
      // Use fallback links if API fails
      console.log("Using fallback social links");
    }
  };

  useEffect(() => {
    fetchSocialLinks();

    // Listen for updates from ManageSocialMedia
    const handleUpdate = () => fetchSocialLinks();
    window.addEventListener("social-media-updated", handleUpdate);
    return () => window.removeEventListener("social-media-updated", handleUpdate);
  }, []);

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="social-links">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link-item"
            >
              {getPlatformIcon(link.platform)}
            </a>
          ))}
        </div>
        <p className="copyright">
          © {new Date().getFullYear()} Youth Power Group South Africa
        </p>
      </div>
    </footer>
  );
};

export default Footer;
