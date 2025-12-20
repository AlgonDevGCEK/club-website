import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top social bar */}
      <div className="footer-top">
        <span>Get connected with us on social networks:</span>
        <div className="social-icons">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">GitHub</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-content">
        <div className="footer-column">
          <h4>ALGON DC</h4>
          <p>
            A student-driven tech community focused on learning, building,
            and growing together through real-world projects.
          </p>
        </div>

        <div className="footer-column">
          <h4>Programs</h4>
          <ul>
            <li>Workshops</li>
            <li>Hackathons</li>
            <li>Projects</li>
            <li>Community Events</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Useful Links</h4>
          <ul>
            <li>About Us</li>
            <li>Gallery</li>
            <li>Contact</li>
            <li>Join Us</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>📍 GCEK, Kerala</p>
          <p>✉️ algondc@example.com</p>
          <p>📞 +91 98765 43210</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} ALGON DC • All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
