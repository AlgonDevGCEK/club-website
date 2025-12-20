import React from 'react'
import './Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'
const Hero = () => {
  return (
     

<div id="home" className="hero container">
  <div className="hero-text">
    <h1 className="logo-title">ALGON DC</h1>
    <h1 className="logo-subtitle">GCEK</h1>

    <h2>Build. Collaborate. Innovate.</h2>
    <br></br>
    <p>
      Take the leap from learning to doing — join us and shape tomorrow.
      Together we build, collaborate, and innovate, turning ideas into real-world impact and preparing the next generation of changemakers.

    </p>

    <button className="btn">
      Join us <img src={dark_arrow} alt="" />
    </button>
  </div>
</div>


  )
}

export default Hero
