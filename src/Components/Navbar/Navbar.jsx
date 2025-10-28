import React from 'react'
import './Navbar.css'
import adclogo from '../../assets/adclogo.png'
const Navbar = () => {
  return (
   <nav className='container'>
    <img src={adclogo} className='logo' />
    <ul>
        <li>
            Home
        </li>
        <li>Program</li>
        <li>About us</li>
        <li>Campus</li>
        <li>Testimonials</li>
        
        <li><button className='btn'>Contact us</button></li>
    </ul>
   </nav>
  )
}

export default Navbar
