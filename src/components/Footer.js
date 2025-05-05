// src/components/Footer.js
import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a
          href="https://www.facebook.com/vygsa/"
          target="_blank"
          rel="noreferrer"
          className="facebook"
        >
          <FaFacebookF />
        </a>
        <a
          href="https://twitter.com/OfficialVYG"
          target="_blank"
          rel="noreferrer"
          className="twitter"
        >
          <FaTwitter />
        </a>
        <a
          href="https://www.instagram.com/vygsa_official/"
          target="_blank"
          rel="noreferrer"
          className="instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.tiktok.com/search?q=vyg%20rsa%20group&t=1746140884456"
          target="_blank"
          rel="noreferrer"
          className="tiktok"
        >
          <FaTiktok />
        </a>
        <a
          href="https://www.youtube.com/@vygsa_official"
          target="_blank"
          rel="noreferrer"
          className="youtube"
        >
          <FaYoutube />
        </a>
      </div>
      <p className="footer-text">© {new Date().getFullYear()} Youth Power Group South Africa</p>
    </footer>
  );
};

export default Footer;
