import React from 'react'
import Navbar from './Components/Navbar/Navbar'

import Hero from './Components/Hero/Hero'


import './index.css'
import UpcomingPrograms from './Components/Programs/UpcommingPrograms'
const App = () => {
  return (
    <div>
      <Navbar></Navbar>
      <Hero></Hero>
     <UpcomingPrograms></UpcomingPrograms>
      
    </div>
  )
}

export default App
