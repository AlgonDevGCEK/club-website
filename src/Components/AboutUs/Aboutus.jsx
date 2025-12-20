import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Background Glow Effects */}
      <div className="glow-blob top-left"></div>
      <div className="glow-blob bottom-right"></div>

      {/* 1. Hero Section */}
      <section className="about-hero">
        <span className="badge">ALGON DC • GCEK</span>
        <h1>Building the Future of Tech</h1>
        <p className="hero-subtitle">
          We are a community of innovators, thinkers, and makers at Government College of Engineering Kannur.
        </p>
      </section>

      {/* 2. Vision & Mission (Zig-Zag Layout) */}
      <section className="zig-zag-section">
        <div className="zig-zag-container">
          
          {/* Vision Section */}
          <div className="zig-zag-item">
            <div className="content">
              <h2>Our Vision</h2>
              <p>
                To create an ecosystem where students can collaborate across disciplines, 
                gain hands-on experience, and grow into industry-ready professionals 
                through real-world projects and mentorship.
              </p>
            </div>
            {/* Visual Card (Replaces your old simple card) */}
            <div className="visual">
              <div className="visual-card gradient-1">
                 <div className="card-logo">
                    <span className="dot"></span>
                    <h3>ALGON DC</h3>
                 </div>
                 <div className="icon-large">👁️</div>
              </div>
            </div>
          </div>

          {/* Community Section (Reversed) */}
          <div className="zig-zag-item reverse">
            <div className="visual">
              <div className="visual-card gradient-2">
                <div className="card-logo">
                    <span className="dot"></span>
                    <h3>ALGON DC</h3>
                 </div>
                 <div className="icon-large">🤝</div>
              </div>
            </div>
            <div className="content">
              <h2>Community Focus</h2>
              <p>
                We believe in the power of peer learning. By connecting seniors with juniors 
                and alumni with students, we bridge the gap between academic theory and 
                practical application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Counter */}
      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Workshops</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">200+</span>
          <span className="stat-label">Active Members</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">15+</span>
          <span className="stat-label">Projects Built</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">5</span>
          <span className="stat-label">Years of Legacy</span>
        </div>
      </section>

      {/* 4. Timeline Section */}
      <section className="timeline-section">
        <h2>Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="date">2024</span>
              <h3>State Hackathon Winners</h3>
              <p>Algon DC team secured 1st prize at the Kerala State Hackathon.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="date">2023</span>
              <h3>Official Club Registration</h3>
              <p>Recognized as an official technical body under GCEK.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="date">2021</span>
              <h3>Inception</h3>
              <p>Founded by a group of CS enthusiasts to foster coding culture.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Team Section */}
      <section className="team-section">
        <h2>Meet The Innovators</h2>
        <div className="team-grid">
          <div className="team-card">
            <div className="member-img"></div>
            <h3>Alex Johnson</h3>
            <span className="role">Chairperson</span>
          </div>
          <div className="team-card">
            <div className="member-img"></div>
            <h3>Sarah Smith</h3>
            <span className="role">Tech Lead</span>
          </div>
           <div className="team-card">
            <div className="member-img"></div>
            <h3>Arun Kumar</h3>
            <span className="role">Event Head</span>
          </div>
           <div className="team-card">
            <div className="member-img"></div>
            <h3>Priya Dev</h3>
            <span className="role">Creative Lead</span>
          </div>
        </div>
      </section>

      {/* 6. Gallery Section */}
      <section className="gallery-section">
        <h2>Moments @ Algon</h2>
        <div className="gallery-grid">
           {/* Replace texts with <img> tags */}
           <div className="gallery-item item-1">Workshop 2024</div>
           <div className="gallery-item item-2">Hackathon Night</div>
           <div className="gallery-item item-3">Team Outing</div>
           <div className="gallery-item item-4">Tech Talk</div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;