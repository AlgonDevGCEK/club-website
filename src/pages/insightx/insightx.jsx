import React, { useState, useEffect } from 'react';
import { Calendar, Code, Database, Zap, Trophy, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './insightx.css';
import { NavLink } from 'react-router-dom';
const InsightXLanding = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [eventDate, setEventDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineData, setTimelineData] = useState([]);

  // Fetch event data from Supabase
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch Event Date (Settings)
        const { data: eventData, error: eventError } = await supabase
          .from('insightx_event')
          .select('start_date, is_live')
          .eq('id', 1)
          .single();

        if (eventData) {
          setEventDate(new Date(eventData.start_date).getTime());
        }
        if (eventError) console.error('Error fetching event date:', eventError);

        // 2. Fetch Timeline Cards (Ordered by sort_order)
        const { data: timeline, error: timelineError } = await supabase
          .from('insightx_timeline')
          .select('*')
          .order('sort_order', { ascending: true });

        if (timeline) {
          setTimelineData(timeline);
        }
        if (timelineError) console.error('Error fetching timeline:', timelineError);

      } catch (err) {
        console.error('Unexpected Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!eventDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;
      
      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <div className="insightx-landing">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Side - Content */}
            <div className="hero-left">
              <div className="badge">
                <span>ADC GCEK Presents</span>
              </div>
              
              <h1 className="main-title">
                <span className="typing-animation">
                  Insight<span className="title-accent">X</span>
                </span>
              </h1>
              
              <p className="subtitle">The Week-Long Project Challenge</p>
              
              <p className="description">
                Build innovative projects across Data Analytics, Prompt Engineering, 
                and Web Development. One week to create, compete, and win!
              </p>

              <NavLink to="/insightx-register" >
              <button className="cta-button">
                Register Now
                <ArrowRight className="button-icon" />
              </button>
              </NavLink>
              
            </div>

            {/* Right Side - Countdown */}
            <div className="hero-right">
              <div className="countdown-card glass-card">
                <p className="countdown-label">Challenge Starts In</p>
                {isLoading && !eventDate ? (
                  <div className="countdown-loading">Loading Timer...</div>
                ) : (
                  <div className="countdown-grid">
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Minutes', value: timeLeft.minutes },
                      { label: 'Seconds', value: timeLeft.seconds }
                    ].map((item, i) => (
                      <div key={i} className="countdown-item">
                        <div className="countdown-value">
                          {String(item.value).padStart(2, '0')}
                        </div>
                        <div className="countdown-label-small">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <div className="container">
          <div className="section-intro">
            <h2 className="section-title">What is InsightX?</h2>
            <p className="section-description">
              InsightX is a week-long project challenge where you tackle real-world problems, 
              build innovative solutions, and compete for the top spot.
            </p>
          </div>

          {/* Domains Section */}
          <div className="domains-grid">
            <div className="domain-card glass-card group">
              <div className="domain-icon domain-icon-blue">
                <Database size={40} />
              </div>
              <h3 className="domain-title">Data Analytics</h3>
              <p className="domain-description">
                Master data visualization and extract meaningful insights using Python and Pandas.
              </p>
            </div>

            <div className="domain-card glass-card group">
              <div className="domain-icon domain-icon-purple">
                <Zap size={40} />
              </div>
              <h3 className="domain-title">Prompt Engineering</h3>
              <p className="domain-description">
                Craft effective prompts and build innovative AI-powered applications.
              </p>
            </div>

            <div className="domain-card glass-card group">
              <div className="domain-icon domain-icon-orange">
                <Code size={40} />
              </div>
              <h3 className="domain-title">Web Development</h3>
              <p className="domain-description">
                Create stunning web applications using modern frameworks.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="how-it-works">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-grid">
              {[
                { step: "01", title: "Register", desc: "Sign up as individual or team", icon: <Calendar size={24} /> },
                { step: "02", title: "Get Problem", desc: "Receive challenge on Dec 22", icon: <Code size={24} /> },
                { step: "03", title: "Build Project", desc: "Create solution in one week", icon: <Zap size={24} /> },
                { step: "04", title: "Win Prizes", desc: "Climb the leaderboard", icon: <Trophy size={24} /> }
              ].map((item, i) => (
                <div key={i} className="step-card glass-card">
                  <div className="step-icon">{item.icon}</div>
                  <div className="step-number">{item.step}</div>
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-description">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC TIMELINE SECTION */}
          <div className="timeline-section">
            <h2 className="section-title">Event Timeline</h2>
            
            {isLoading ? (
               <div className="text-center text-gray-400">Loading timeline...</div>
            ) : (
              <div className="timeline-grid">
                {timelineData.map((item) => (
                  <div 
                    key={item.id} 
                    className={`timeline-card glass-card ${item.highlight ? 'highlight' : ''}`}
                  >
                    <div className="timeline-week">{item.week}</div>
                    <div className="timeline-date">{item.date_text}</div>
                    <h3 className="timeline-title">{item.title}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: <Clock size={28} />, value: "7 Days", label: "Duration" },
              { icon: <Code size={28} />, value: "3 Domains", label: "To Choose" },
              { icon: <Trophy size={28} />, value: "Live", label: "Leaderboard" }
            ].map((stat, i) => (
              <div key={i} className="stat-card glass-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="final-cta glass-card">
            <h2>Ready to Take the Challenge?</h2>
            <p>Join hundreds of students building the future</p>
            <button className="cta-button cta-large">
              Register for InsightX
              <ArrowRight className="button-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightXLanding;