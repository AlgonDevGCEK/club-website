import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { ArrowRight, CheckCircle, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import './InsightXRegister.css'; 

const InsightXRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [teamName, setTeamName] = useState('');

  // --- 1. DEFAULT MEMBERS STATE (Leader + 1 Member) ---
  // "A team min size is 4" logic note:
  // If you strictly require 4 people, change the initial state below to have 4 objects.
  // Currently set to 2 slots as per your "default two members slot" instruction.
  const [members, setMembers] = useState([
    { fullName: '', email: '', phone: '', role: 'Leader' }, // Slot 1 (Leader)
    { fullName: '', email: '', phone: '', role: 'Member' }  // Slot 2 (Default Member)
  ]);

  // --- ACTIONS ---

  // Handle Member Change
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // Add New Member (Max 4)
  const addMember = () => {
    if (members.length < 4) {
      setMembers([
        ...members, 
        { fullName: '', email: '', phone: '', role: 'Member' }
      ]);
    }
  };

  // Remove Member (Min 2)
  const removeMember = (index) => {
    // Prevent removing Leader (0) or if it drops below 2 members
    if (index === 0) return;
    if (members.length <= 2) {
      alert("Minimum team size is 2 members (Leader + 1).");
      return;
    }
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  // --- VALIDATION & CHECKS ---

  // Check Team Name Availability (Backend Call)
  const checkNameAvailability = async () => {
    if (!teamName.trim()) {
      setNameError("Please enter a team name.");
      return false;
    }

    setCheckingName(true);
    setNameError(""); // Clear prev errors

    try {
      // Call our new SQL function
      const { data: isTaken, error } = await supabase
        .rpc('check_team_name_taken', { p_name: teamName.trim() });

      if (error) throw error;

      if (isTaken) {
        setNameError("🚫 This team name is already taken. Be creative!");
        return false;
      }
      
      return true; // Available!

    } catch (err) {
      console.error("Check Error", err);
      setNameError("Connection error. Please try again.");
      return false;
    } finally {
      setCheckingName(false);
    }
  };

  // Step 1 -> Step 2 Transition Handler
  const handleNextStep = async () => {
    const isAvailable = await checkNameAvailability();
    if (isAvailable) {
      setStep(2);
    }
  };

  const validateForm = () => {
    // 1. Members Validation
    for (const m of members) {
      if (!m.fullName || !m.email || !m.phone) {
        return "All member details (Name, Email, Phone) are required.";
      }
      // Basic Email Regex
      if (!/\S+@\S+\.\S+/.test(m.email)) return `Invalid email for ${m.fullName}`;
      // Basic Phone Length
      if (m.phone.length < 10) return `Phone number for ${m.fullName} seems invalid.`;
    }
    
    // 2. Duplicate Check
    const emails = members.map(m => m.email.toLowerCase());
    if (new Set(emails).size !== emails.length) return "Duplicate email addresses found in the team.";

    return null;
  };

  // --- FINAL SUBMISSION ---
  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const leader = members[0];
      const otherMembers = members.slice(1);

      // Double check name uniqueness one last time before insert
      // (Just in case someone else took it while they were filling the form)
      const { error } = await supabase
        .from('insightx_teams')
        .insert([{
          team_name: teamName.trim(),
          leader_name: leader.fullName,
          leader_email: leader.email,
          leader_phone: leader.phone,
          members: otherMembers,
          total_score: 0
        }]);

      if (error) {
        // Handle unique constraint violation specifically
        if (error.code === '23505') throw new Error("Team Name was just taken! Please go back and change it.");
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
          <p><strong>{teamName}</strong> is now live on the system.</p>
          <div className="warning-box mt-4">
            IMPORTANT: Your Team Name is your <strong>Submission Key</strong>. 
            Do not forget it.
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

        {/* STEP 1: TEAM NAME & CHECK */}
        {step === 1 && (
          <div className="form-step animate-fade-in">
            <h2>Create Your Identity</h2>
            <p className="text-muted-sm">Choose a unique team name. This will be your login key.</p>
            
            <div className="form-group mt-4">
              <label>Team Name</label>
              <input 
                value={teamName} 
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setNameError(''); // Clear error on type
                }} 
                placeholder="e.g. Null Pointers" 
                className={`input-field ${nameError ? 'error-border' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
              />
              
              {/* Error / Status Message */}
              {nameError && (
                <div className="error-msg">
                  <AlertCircle size={16} /> {nameError}
                </div>
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
            <h2>Squad Roster</h2>
            <p className="text-muted-sm">Fill in details for all {members.length} members.</p>
            
            <div className="members-list">
              {members.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-header">
                    <h4>
                      {index === 0 ? <span className="leader-badge">👑 Team Leader</span> : `Member ${index + 1}`}
                    </h4>
                    {/* Only show delete if it's NOT the leader AND we have more than 2 members */}
                    {index > 0 && members.length > 2 && (
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

            {/* Add Member Button (Max 4) */}
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