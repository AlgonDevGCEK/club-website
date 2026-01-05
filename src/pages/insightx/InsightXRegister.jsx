import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Users, ArrowRight, CheckCircle, Plus, Trash2, Loader2, User } from 'lucide-react';
import './InsightXRegister.css'; 

const InsightXRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');

  // We start with 1 member (The Leader)
  // We will separate Leader from Members for the DB, but keep them in one array for the UI
  const [members, setMembers] = useState([
    { fullName: '', email: '', phone: '', role: 'Leader' } 
  ]);

  // --- ACTIONS ---

  // Handle Member Change
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // Add New Member (Max 4 Total)
  const addMember = () => {
    if (members.length < 4) {
      setMembers([
        ...members, 
        { fullName: '', email: '', phone: '', role: 'Member' }
      ]);
    }
  };

  // Remove Member
  const removeMember = (index) => {
    if (index === 0) return; // Cannot remove leader
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  // --- VALIDATION ---
  const validateForm = () => {
    if (!teamName.trim()) return "Team Name is required.";
    
    for (const m of members) {
      if (!m.fullName || !m.email || !m.phone) {
        return "All fields (Name, Email, Phone) are required for all members.";
      }
      if (!/\S+@\S+\.\S+/.test(m.email)) return `Invalid email for ${m.fullName}`;
      if (m.phone.length < 10) return `Phone number for ${m.fullName} must be valid`;
    }
    
    const emails = members.map(m => m.email);
    if (new Set(emails).size !== emails.length) return "Duplicate emails found.";

    return null;
  };

  // --- BACKEND SUBMISSION ---
  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setLoading(true);
    try {
      // 1. Separate Leader from other members
      const leader = members[0];
      const otherMembers = members.slice(1); // Array of the rest

      // 2. Insert into 'insightx_teams'
      const { error } = await supabase
        .from('insightx_teams')
        .insert([{
          team_name: teamName,
          leader_name: leader.fullName,
          leader_email: leader.email,
          leader_phone: leader.phone,
          members: otherMembers // Stores the rest as JSON
        }]);

      if (error) {
        if (error.code === '23505') throw new Error("Team Name already exists! Please choose another.");
        throw error;
      }

      setSuccess(true);

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER SUCCESS ---
  if (success) {
    return (
      <div className="register-container">
        <div className="success-container glass-card text-center">
          <CheckCircle size={64} className="text-green-500 mb-4 mx-auto" />
          <h2>Registration Successful!</h2>
          <p>Your team <strong>{teamName}</strong> is ready for battle.</p>
          <p className="text-muted">Remember your Team Name. You will need it to submit your projects.</p>
          <button onClick={() => window.location.href='/insightx'} className="cta-button mt-4">
            Go to Event Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card glass-card">
        
        {/* Progress Dots */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {/* STEP 1: TEAM NAME */}
        {step === 1 && (
          <div className="form-step animate-fade-in">
            <h2>Team Registration</h2>
            <p className="text-muted-sm">Create a unique identity for your squad.</p>
            
            <div className="form-group mt-4">
              <label>Team Name</label>
              <input 
                value={teamName} 
                onChange={(e) => setTeamName(e.target.value)} 
                placeholder="e.g. Code Warriors" 
                className="input-field"
              />
            </div>

            <button className="cta-button w-full mt-4" onClick={() => {
              if(!teamName.trim()) alert("Please enter a team name");
              else setStep(2);
            }}>
              Next Step <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: MEMBER DETAILS */}
        {step === 2 && (
          <div className="form-step animate-fade-in">
            <h2>Team Members</h2>
            <p className="text-muted-sm">Add up to 4 members. The first member is the Leader.</p>
            
            <div className="members-list">
              {members.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-header">
                    <h4>
                      {index === 0 ? <span className="leader-badge">👑 Team Leader</span> : `Member ${index + 1}`}
                    </h4>
                    {index > 0 && (
                      <button className="delete-btn" onClick={() => removeMember(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="member-inputs">
                    <input 
                      placeholder="Full Name" 
                      value={member.fullName}
                      onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone" 
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {members.length < 4 && (
              <button className="add-member-btn" onClick={addMember}>
                <Plus size={18} /> Add Team Member
              </button>
            )}

            <div className="form-actions">
              <button className="secondary-btn" onClick={() => setStep(1)}>Back</button>
              <button className="cta-button" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="spinner" /> : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InsightXRegister;