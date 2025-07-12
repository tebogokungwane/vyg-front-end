import React from 'react';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaTiktok, 
  FaYoutube 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="social-links">
          <a href="https://www.facebook.com/vygsa/" target="_blank" rel="noopener noreferrer">
            <FaFacebookF className="social-icon facebook" />
          </a>
          <a href="https://twitter.com/OfficialVYG" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="social-icon twitter" />
          </a>
          <a href="https://www.instagram.com/vygsa_official/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="social-icon instagram" />
          </a>
          <a href="https://www.tiktok.com/search?q=vyg%20rsa%20group&t=1746140884456" target="_blank" rel="noopener noreferrer">
            <FaTiktok className="social-icon tiktok" />
          </a>
          <a href="https://www.youtube.com/@vygsa_official" target="_blank" rel="noopener noreferrer">
            <FaYoutube className="social-icon youtube" />
          </a>
        </div>
        <p className="copyright">
          © {new Date().getFullYear()} Youth Power Group South Africa
        </p>
      </div>
    </footer>
  );
};

export default Footer;