import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { 
  MessageCircle, CheckCircle, ArrowLeft, Calendar, 
  MapPin, UserCheck, Smartphone, Edit3, Send 
} from 'lucide-react';
import './EventRegistration.css';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Steps: 1 = Form, 2 = Preview, 3 = Success
  const [step, setStep] = useState(1); 

  const [formData, setFormData] = useState({
    full_name: '',
    branch: '',
    year: '1st Year',
    phone_number: '',
    email: ''
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      // A. Get Event Details
      const { data: eventData, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !eventData) {
        alert("Event not found!");
        navigate('/upcoming-programs');
        return;
      }
      setEvent(eventData);

      // B. Get User Session & Profile
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setCurrentUser(session.user); // Store for submission later
        setIsMember(true);
        
        // Fetch Member Data for Autofill
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setFormData(prev => ({
          ...prev,
          email: session.user.email,
          full_name: memberData?.full_name || '',
          branch: memberData?.branch || '',
          phone_number: memberData?.phone_number || ''
        }));
      }
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReview = (e) => {
    e.preventDefault();
    setStep(2); // Move to Preview
  };

  const handleEdit = () => {
    setStep(1); // Go back to Edit
  };

  const handleFinalSubmit = async () => {
    // 1. Prepare Payload
    const submissionData = {
      event_id: id,
      user_id: currentUser ? currentUser.id : null, // Critical Link for Dashboard
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      branch: formData.branch,
      year: formData.year
    };

    // 2. Insert to Supabase
    const { error } = await supabase
      .from('registrations')
      .insert([submissionData]);

    if (error) {
      alert("Registration failed: " + error.message);
    } else {
      setStep(3); // Move to Success
    }
  };

  if (loading) return <div className="loading-screen">Loading details...</div>;

  return (
    <div className="reg-page-wrapper">
      <div className="reg-container">
        
        {/* Navigation / Header */}
        {step < 3 && (
          <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="back-nav-btn">
            <ArrowLeft size={18} /> {step === 1 ? 'Back' : 'Edit Details'}
          </button>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div className="success-card animate-scale-in">
            <div className="success-icon">
              <CheckCircle size={60} color="#10b981" />
            </div>
            <h2>You're In! 🎉</h2>
            <p>Registration confirmed for <strong>{event.title}</strong>.</p>
            
            {/* Dynamic WhatsApp Link from Database */}
            {event.whatsapp_link && (
              <a href={event.whatsapp_link} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                <MessageCircle size={20} /> Join WhatsApp Group
              </a>
            )}
            <p className="small-note">Please check your email for the ticket.</p>
            <button onClick={() => navigate('/upcoming-programs')} className="secondary-btn">
              Explore More Events
            </button>
          </div>
        )}

        {/* --- STEPS 1 & 2 CONTAINER --- */}
        {step < 3 && (
          <div className="form-card">
            <div className="form-header">
              <span className="event-type-tag">{event.type}</span>
              <h1>{event.title}</h1>
              <div className="header-meta">
                <span><Calendar size={14}/> {event.date}</span>
                <span><MapPin size={14}/> {event.location}</span>
              </div>
            </div>

            {/* --- STEP 2: PREVIEW MODE --- */}
            {step === 2 && (
              <div className="preview-section animate-fade-in">
                <h3>Please review your details</h3>
                <div className="preview-grid">
                  <div className="preview-item">
                    <label>Name</label>
                    <div>{formData.full_name}</div>
                  </div>
                  <div className="preview-item">
                    <label>Email</label>
                    <div>{formData.email}</div>
                  </div>
                  <div className="preview-item">
                    <label>Phone</label>
                    <div>{formData.phone_number}</div>
                  </div>
                  <div className="preview-item">
                    <label>Branch & Year</label>
                    <div>{formData.branch} - {formData.year}</div>
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={handleEdit} className="edit-btn">
                    <Edit3 size={18} /> Edit
                  </button>
                  <button onClick={handleFinalSubmit} className="submit-reg-btn">
                    Confirm & Submit <Send size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 1: INPUT FORM --- */}
            {step === 1 && (
              <form onSubmit={handleReview} className="animate-fade-in">
                {isMember && (
                  <div className="member-privilege-badge">
                    <UserCheck size={16} /> Member Details Auto-Filled
                  </div>
                )}

                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" name="full_name" required 
                    value={formData.full_name} onChange={handleChange}
                    disabled={isMember} 
                    className={isMember ? 'locked-input' : ''}
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" name="email" required 
                    value={formData.email} onChange={handleChange}
                    disabled={isMember} 
                    className={isMember ? 'locked-input' : ''}
                  />
                </div>

                <div className="row-group">
                  <div className="input-group">
                    <label>Branch</label>
                    <input 
                      type="text" name="branch" required placeholder="Ex: CSE"
                      value={formData.branch} onChange={handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <label>Year</label>
                    <select name="year" value={formData.year} onChange={handleChange}>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>WhatsApp Number <Smartphone size={14} style={{marginLeft:5}}/></label>
                  <input 
                    type="tel" name="phone_number" required placeholder="+91..."
                    value={formData.phone_number} onChange={handleChange}
                  />
                </div>

                <button type="submit" className="review-btn">
                  Review Details
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;