import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Users, ArrowRight, CheckCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import './InsightXRegister.css'; // Create a basic CSS file for styling

const InsightXRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- FORM STATE ---
  const [regType, setRegType] = useState('team'); // 'individual' or 'team'
  const [basicInfo, setBasicInfo] = useState({
    teamName: '',
    domain: 'Web Development' // Default
  });

  // We start with 1 member (The Leader)
  const [members, setMembers] = useState([
    { fullName: '', email: '', phone: '', rollNumber: '', role: 'leader' }
  ]);

  // --- ACTIONS ---

  // Handle Basic Info Change
  const handleBasicChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  // Handle Member Change
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // Add New Member
  const addMember = () => {
    if (members.length < 4) {
      setMembers([
        ...members, 
        { fullName: '', email: '', phone: '', rollNumber: '', role: 'member' }
      ]);
    }
  };

  // Remove Member
  const removeMember = (index) => {
    if (members.length > 1) {
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    }
  };

  // --- VALIDATION ---
  const validateForm = () => {
    // 1. Basic Checks
    if (regType === 'team' && !basicInfo.teamName.trim()) return "Team Name is required.";
    
    // 2. Member Checks
    for (const m of members) {
      if (!m.fullName || !m.email || !m.phone || !m.rollNumber) {
        return "All member fields are required.";
      }
      // Simple Email Regex
      if (!/\S+@\S+\.\S+/.test(m.email)) return `Invalid email for ${m.fullName}`;
      // Phone Length Check
      if (m.phone.length < 10) return `Phone number for ${m.fullName} must be 10 digits`;
    }
    
    // 3. Duplicate Email Check
    const emails = members.map(m => m.email);
    if (new Set(emails).size !== emails.length) return "Duplicate emails found.";

    return null; // No errors
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
      // 1. Insert into REGISTRATIONS table
      // Logic: If individual, Team Name is the person's name
      const teamNameFinal = regType === 'team' ? basicInfo.teamName : members[0].fullName;
      const leader = members[0];

      const { data: regData, error: regError } = await supabase
        .from('insightx_registrations')
        .insert([{
          reg_type: regType,
          domain: basicInfo.domain,
          team_name: teamNameFinal,
          leader_name: leader.fullName,
          leader_email: leader.email,
          leader_phone: leader.phone
        }])
        .select()
        .single(); // Important: Returns the inserted row so we get the ID

      if (regError) throw regError;

      const regId = regData.id;

      // 2. Prepare Participants Data
      // Map over members and add the registration_id
      const participantsToInsert = members.map(m => ({
        registration_id: regId,
        full_name: m.fullName,
        email: m.email,
        phone: m.phone,
        // You might need to add a roll_number column to your DB schema if strictly required
        // roll_number: m.rollNumber, 
        role: m.role
      }));

      // 3. Bulk Insert into PARTICIPANTS table
      const { error: partError } = await supabase
        .from('insightx_participants')
        .insert(participantsToInsert);

      if (partError) throw partError;

      // Success!
      setSuccess(true);

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  if (success) {
    return (
    
      <div className="success-container glass-card">
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2>You're Registered!</h2>
        <p>Welcome to InsightX. We have sent a confirmation email to the team leader.</p>
        <button onClick={() => window.location.href='/'} className="cta-button mt-4">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card glass-card">
        
        {/* Progress Bar */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <div className="form-step animate-fade-in">
            <h2>Basic Information</h2>
            
            {/* Toggle */}
            <div className="reg-type-toggle">
              <button 
                className={regType === 'team' ? 'active' : ''} 
                onClick={() => setRegType('team')}
              >
                <Users size={18} /> Team
              </button>
              <button 
                className={regType === 'individual' ? 'active' : ''} 
                onClick={() => setRegType('individual')}
              >
                <User size={18} /> Individual
              </button>
            </div>

            {/* Inputs */}
            {regType === 'team' && (
              <div className="form-group">
                <label>Team Name</label>
                <input 
                  name="teamName" 
                  value={basicInfo.teamName} 
                  onChange={handleBasicChange} 
                  placeholder="e.g. Code Warriors" 
                />
              </div>
            )}

            <div className="form-group">
              <label>Select Domain</label>
              <select name="domain" value={basicInfo.domain} onChange={handleBasicChange}>
                <option>Web Development</option>
                <option>Data Analytics</option>
                <option>Prompt Engineering</option>
              </select>
            </div>

            <button className="cta-button w-full" onClick={() => setStep(2)}>
              Next Step <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: PARTICIPANTS */}
        {step === 2 && (
          <div className="form-step animate-fade-in">
            <h2>{regType === 'team' ? 'Team Details' : 'Your Details'}</h2>
            
            <div className="members-list">
              {members.map((member, index) => (
                <div key={index} className="member-card">
                  <div className="member-header">
                    <h4>{index === 0 ? (regType === 'team' ? 'Team Leader' : 'You') : `Member ${index + 1}`}</h4>
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
                      placeholder="Roll Number" 
                      value={member.rollNumber}
                      onChange={(e) => handleMemberChange(index, 'rollNumber', e.target.value)}
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

            {/* Add Member Button (Only for Teams) */}
            {regType === 'team' && members.length < 4 && (
              <button className="add-member-btn" onClick={addMember}>
                <Plus size={18} /> Add Team Member
              </button>
            )}

            <div className="form-actions">
              <button className="secondary-btn" onClick={() => setStep(1)}>Back</button>
              <button className="cta-button" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="spinner" /> : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InsightXRegister;