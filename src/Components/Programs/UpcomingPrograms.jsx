import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import { X, Clock, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import './UpcomingPrograms.css';

const UpcomingPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null); // Controls the Modal
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch Data
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      // Sort by date so nearest events appear first
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Helper for Status Badge
  const getEventStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (eventDate < today) return { label: 'Ended', style: 'badge-ended' };
    if (eventDate.toDateString() === today.toDateString()) return { label: 'Happening Now', style: 'badge-live' };
    return { label: 'Upcoming', style: 'badge-upcoming' };
  };

  return (
    <div id="upcoming-programs" className="upcoming-section">
      <div className="upcoming-container">
        
        {/* Header */}
        <div className="upcoming-header">
          <h2 className="upcoming-title">Programs & Events</h2>
          <p className="upcoming-subtitle">Join our exciting events and level up your skills</p>
        </div>

        {/* Loading State */}
        {loading && <p className="loading-text">Loading events...</p>}

        {/* Grid */}
        <div className="upcoming-grid">
          {programs.map((program) => {
            const status = getEventStatus(program.date);

            return (
              <div 
                key={program.id} 
                className="program-card" 
                onClick={() => setSelectedProgram(program)} // Open Modal
              >
                <span className={`program-badge ${status.style}`}>
                  {status.label}
                </span>

                <h3 className="program-title">{program.title}</h3>
                <p className="program-description">{program.description}</p>

                <div className="program-meta">
                  <div className="meta-item"><Calendar size={16}/> {program.date}</div>
                  <div className="meta-item"><Clock size={16}/> {program.time}</div>
                </div>

                <div className="program-footer">
                   <div className="program-seats">
                      <span className="seats-indicator"></span>
                      <span>{program.total_seats} Seats</span>
                   </div>
                   <button className="register-btn">View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 👇 MAXIMIZED MODAL 👇 */}
      {selectedProgram && (
        <div className="program-modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="program-modal" onClick={e => e.stopPropagation()}>
            
            <button className="modal-close" onClick={() => setSelectedProgram(null)}>
              <X size={24} />
            </button>

            <div className="modal-content">
              <span className="modal-type-badge">{selectedProgram.type}</span>
              <h2>{selectedProgram.title}</h2>
              
              <div className="modal-grid">
                <div className="modal-info">
                   <div className="info-row"><Calendar className="icon"/> {selectedProgram.date}</div>
                   <div className="info-row"><Clock className="icon"/> {selectedProgram.time}</div>
                   <div className="info-row"><MapPin className="icon"/> {selectedProgram.location}</div>
                   <div className="info-row"><Users className="icon"/> {selectedProgram.total_seats} Capacity</div>
                </div>
                
                {/* Event Status Box */}
                <div className={`status-box ${getEventStatus(selectedProgram.date).style}`}>
                   <strong>Status:</strong> {getEventStatus(selectedProgram.date).label}
                </div>
              </div>

              <div className="modal-description">
                <h3>About the Event</h3>
                <p>{selectedProgram.full_details || selectedProgram.description}</p>
              </div>

              <div className="modal-actions">
                 {/* This button takes them to the Registration Page */}
                 <button 
                   className="modal-register-btn"
                   onClick={() => navigate(`/register/${selectedProgram.id}`)}
                   disabled={getEventStatus(selectedProgram.date).label === 'Ended'}
                 >
                   {getEventStatus(selectedProgram.date).label === 'Ended' ? 'Event Closed' : 'Proceed to Registration'}
                   {getEventStatus(selectedProgram.date).label !== 'Ended' && <ArrowRight size={18} />}
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingPrograms;