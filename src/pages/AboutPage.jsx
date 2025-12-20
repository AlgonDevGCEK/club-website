import React from "react";
import AboutUs from "../Components/AboutUs/AboutUs";
import "./AboutPage.css";
const AboutPage = () => {
  return (
    <>
    <div className="about-page">


      <AboutUs
        title="Our Vision"
        content="To create an ecosystem where students can collaborate across disciplines, gain hands-on experience, and grow into industry-ready professionals through real-world projects and mentorship."
        gradient="linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 0, 128, 0.3))"
      />

     
    </div>
    </>
  );
};

export default AboutPage;
