import Navbar from '../Components/Navbar/Navbar'
import Hero from '../Components/Hero/Hero'
import AboutUs from '../Components/AboutUs/Aboutus'
import UpcomingPrograms from '../Components/Programs/UpcommingPrograms'

const Home = () => {
  return (
    <div>
      <div className='nav-hero'>
        <Navbar />
        <Hero />
      </div>

      <UpcomingPrograms />

      <AboutUs
        title="Our Vision"
        content="To create an ecosystem where students can collaborate across disciplines..."
        gradient="linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 0, 128, 0.3))"
      />

      <AboutUs
        title="Community Focus"
        content="ADC focuses on creating an inclusive space..."
        gradient="linear-gradient(135deg, rgba(2, 28, 200, 0.1), rgba(20, 20, 170, 0.3))"
      />

      <AboutUs
        title="What we do"
        content="The Algon Developer Community (ADC) is a student-driven tech community..."
        gradient="linear-gradient(135deg, rgba(37, 81, 81, 0.1), rgba(57, 57, 143, 0.3))"
      />

      <AboutUs
        title="Our Mission"
        content="A space for curious minds, builders & innovators!"
        gradient="linear-gradient(135deg, rgba(179, 112, 82, 0.1), rgba(213, 12, 29, 0.3))"
      />
    </div>
  )
}

export default Home
