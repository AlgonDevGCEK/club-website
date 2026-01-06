import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  ArrowRight, CheckCircle, Plus, Trash2, Loader2, AlertCircle, MessageCircle 
} from 'lucide-react';
import './InsightXRegister.css'; 

// --- CONSTANTS ---
const BRANCHES = ["CSE", "ECE", "EEE", "ME", "CE"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const InsightXRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [teamName, setTeamName] = useState('');

  // --- STATE INITIALIZATION ---
  // Slot 1: Leader (Has Email & Phone)
  // Slot 2: Member (No Email required, Phone optional/removed based on pref)
  const [members, setMembers] = useState([
    { fullName: '', email: '', phone: '', branch: 'CSE', year: '1st Year', role: 'Leader' }, 
    { fullName: '', branch: 'CSE', year: '1st Year', role: 'Member' } 
  ]);

  // --- ACTIONS ---

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const addMember = () => {
    if (members.length < 4) {
      setMembers([
        ...members, 
        // New members don't need email/phone, just academic info
        { fullName: '', branch: 'CSE', year: '1st Year', role: 'Member' }
      ]);
    }
  };

  const removeMember = (index) => {
    if (index === 0) return; 
    if (members.length <= 2) {
      alert("Minimum team size is 2 members (Leader + 1).");
      return;
    }
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  // --- VALIDATION & CHECKS ---

  const checkNameAvailability = async () => {
    if (!teamName.trim()) {
      setNameError("Please enter a team name.");
      return false;
    }
    setCheckingName(true);
    setNameError(""); 

    try {
      const { data: isTaken, error } = await supabase
        .rpc('check_team_name_taken', { p_name: teamName.trim() });

      if (error) throw error;

      if (isTaken) {
        setNameError("This team name is already taken. Be creative!");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Check Error", err);
      setNameError("Connection error. Please try again.");
      return false;
    } finally {
      setCheckingName(false);
    }
  };

  const handleNextStep = async () => {
    const isAvailable = await checkNameAvailability();
    if (isAvailable) setStep(2);
  };

  const validateForm = () => {
    for (const [index, m] of members.entries()) {
      // 1. Common checks
      if (!m.fullName || !m.branch || !m.year) {
        return `Name, Branch, and Year are required for ${m.role} (${index + 1})`;
      }

      // 2. Leader Specific Checks
      if (index === 0) {
        if (!m.email || !m.phone) return "Leader Email and Phone are required.";
        if (!/\S+@\S+\.\S+/.test(m.email)) return "Invalid Leader Email.";
        if (m.phone.length < 10) return "Invalid Leader Phone Number.";
      }
    }
    return null;
  };

  // --- SUBMISSION ---
  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const leader = members[0];
      const otherMembers = members.slice(1); // Rest of the team

      const { error } = await supabase
        .from('insightx_teams')
        .insert([{
          team_name: teamName.trim(),
          
          // Leader Details (Top Level Columns)
          leader_name: leader.fullName,
          leader_email: leader.email,
          leader_phone: leader.phone,
          leader_branch: leader.branch,
          leader_year: leader.year,
          
          // Other Members (JSONB)
          members: otherMembers, 
          
          total_score: 0
        }]);

      if (error) {
        if (error.code === '23505') throw new Error("Team Name taken! Please go back and change it.");
        throw error;
      }

      setSuccess(true);

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- SUCCESS VIEW ---
  if (success) {
    return (
      <div className="register-container">
        <div className="success-container glass-card">
          <CheckCircle size={64} className="text-green-500 mb-4 mx-auto" />
          <h2>Squad Registered!</h2>
          <p><strong>{teamName}</strong> is ready for battle.</p>
          
          {/* WhatsApp Group Button */}
          <a 
            href="https://chat.whatsapp.com/Dc6dyXFlrhuKTNJuO3KEan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="whatsapp-btn"
          >
            <MessageCircle size={20} /> Join WhatsApp Group
          </a>

          <div className="warning-box mt-4">
             IMPORTANT: Your Team Name is your <strong>Submission Key</strong>.
          </div>
          
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
            <h2>Create Identity</h2>
            <p className="text-muted-sm">Choose a unique team name.</p>
            
            <div className="form-group mt-4">
              <label>Team Name</label>
              <input 
                value={teamName} 
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setNameError('');
                }} 
                placeholder="e.g. Null Pointers" 
                className={`input-field ${nameError ? 'error-border' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
              />
              {nameError && (
                <div className="error-msg"><AlertCircle size={16} /> {nameError}</div>
              )}
            </div>

            <button className="cta-button w-full mt-4" onClick={handleNextStep} disabled={checkingName}>
              {checkingName ? <Loader2 className="spinner" /> : (
                <>Next Step <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: MEMBER DETAILS */}
        {step === 2 && (
          <div className="form-step animate-fade-in">
            <h2>Squad Details</h2>
            <p className="text-muted-sm">Enter academic details for all members.</p>
            
            <div className="members-list">
              {members.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-header">
                    <h4>
                      {index === 0 ? <span className="leader-badge">👑 Team Leader</span> : `Member ${index + 1}`}
                    </h4>
                    {index > 0 && members.length > 2 && (
                      <button className="delete-btn" onClick={() => removeMember(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="member-inputs-grid">
                    {/* Full Name (Full Width) */}
                    <div className="input-full-width">
                      <input 
                        placeholder="Full Name" 
                        value={member.fullName}
                        onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                      />
                    </div>

                    {/* ACADEMIC INFO (Row 2) */}
                    <select 
                      value={member.branch}
                      onChange={(e) => handleMemberChange(index, 'branch', e.target.value)}
                    >
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>

                    <select 
                      value={member.year}
                      onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    {/* CONTACT INFO (Leader Only) */}
                    {index === 0 && (
                      <>
                        <input 
                          type="email" 
                          placeholder="Leader Email" 
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        />
                        <input 
                          type="tel" 
                          placeholder="Leader Phone" 
                          value={member.phone}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        />
                      </>
                    )}
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