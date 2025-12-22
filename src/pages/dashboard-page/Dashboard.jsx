import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { Edit2, Check, X, Download, Calendar, Bell, Camera, LogOut } from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIdModal, setShowIdModal] = useState(false);
  const [editingField, setEditingField] = useState(null); 
  const [tempValue, setTempValue] = useState("");
  const [uploading, setUploading] = useState(false);

  const idCardRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMemberData();
  }, [navigate]);

  const fetchMemberData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    const { data, error } = await supabase.from("members").select("*").eq("user_id", user.id).single();
    if (error) console.error(error); else setMember(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleImageUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 500 * 1024) { alert("File too big (Max 500KB)"); return; }

      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${member.user_id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("avatar").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatar").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("members").update({ profile_pic: publicUrl }).eq("user_id", member.user_id);
      if (updateError) throw updateError;

      setMember({ ...member, profile_pic: publicUrl });
      alert("Photo updated!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (field, val) => { setEditingField(field); setTempValue(val); };
  const cancelEditing = () => { setEditingField(null); setTempValue(""); };
  
  const saveEditing = async (field) => {
     const { error } = await supabase.from("members").update({ [field]: tempValue }).eq("user_id", member.user_id);
     if (error) alert("Error updating");
     else { setMember({...member, [field]: tempValue}); setEditingField(null); }
  };

  const downloadImage = async () => {
    if (!idCardRef.current) return;
    const canvas = await html2canvas(idCardRef.current, { backgroundColor: "#ffffff", scale: 3, useCORS: true });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${member.name}_ID.png`;
    link.click();
  };

  if (loading) return <div className="dashboard-wrapper"><div className="loader"></div></div>;

  const verificationLink = `${window.location.origin}/verify/${member.user_id}`;
  const validTill = `March ${new Date().getFullYear() + 1}`;

  return (
    <div className="dashboard-wrapper">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageUpload}/>

      {/* HERO SECTION */}
      <div className="dashboard-hero">
        <div className="hero-content">
          {/* Clickable Avatar */}
          <div className="avatar-container" onClick={handleAvatarClick}>
            <div className="avatar-large">
               {member.profile_pic ? <img src={member.profile_pic} alt="Profile" /> : <span>{member.name.charAt(0)}</span>}
            </div>
            <div className="avatar-overlay">{uploading ? <div className="loader-small"></div> : <Camera size={24} color="white" />}</div>
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {member.name.split(" ")[0]}!</h1>
            <div className="badges">
              <span className="badge active">● Active Member</span>
              <span className="badge dept">{member.department}</span>
            </div>
          </div>
        </div>
        <button className="view-id-btn" onClick={() => setShowIdModal(true)}>🪪 View Digital ID</button>
      </div>

      <div className="dashboard-grid">
        {/* PROFILE CARD */}
        <div className="info-card">
          <h3>Personal Details</h3>
          
          <div className="detail-row locked">
            <label>Email:</label> <div className="value">{member.email}</div>
          </div>
          
          <div className="detail-row locked">
             <label>Full Name:</label> <div className="value">{member.name}</div>
          </div>

          {/* Phone Edit */}
          <div className="detail-row">
            <label>Phone:</label>
            {editingField === "phone" ? (
              <div className="edit-mode">
                <input value={tempValue} onChange={(e) => setTempValue(e.target.value)} autoFocus />
                <button onClick={() => saveEditing("phone")} className="save-icon"><Check size={18}/></button>
                <button onClick={cancelEditing} className="cancel-icon"><X size={18}/></button>
              </div>
            ) : (
              <div className="value-group">
                <span>{member.phone}</span>
                <button onClick={() => startEditing("phone", member.phone)} className="edit-icon"><Edit2 size={16}/></button>
              </div>
            )}
          </div>

          {/* Year Edit */}
          <div className="detail-row">
            <label>Year:</label>
            {editingField === "year" ? (
              <div className="edit-mode">
                 <select value={tempValue} onChange={(e) => setTempValue(e.target.value)}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                 </select>
                 <button onClick={() => saveEditing("year")} className="save-icon"><Check size={18}/></button>
                 <button onClick={cancelEditing} className="cancel-icon"><X size={18}/></button>
              </div>
            ) : (
              <div className="value-group">
                <span>{member.year}</span>
                <button onClick={() => startEditing("year", member.year)} className="edit-icon"><Edit2 size={16}/></button>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-btn-danger">
            <LogOut size={18} style={{marginRight:'8px'}}/> Log Out
          </button>
        </div>

        {/* UPDATES COLUMN */}
        <div className="updates-column">
          <div className="placeholder-card">
            <div className="card-header"><Calendar size={20} className="icon-blue"/> <h4>Upcoming Events</h4></div>
            <div className="empty-state"><p>No events scheduled for this week.</p><button className="small-btn">View Calendar</button></div>
          </div>
          <div className="placeholder-card">
            <div className="card-header"><Bell size={20} className="icon-yellow"/> <h4>Announcements</h4></div>
            <div className="empty-state"><p>Welcome to the new Student Portal!</p></div>
          </div>
        </div>
      </div>

      {/* ID CARD MODAL */}
      {showIdModal && (
        <div className="modal-overlay" onClick={() => setShowIdModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowIdModal(false)}><X size={24}/></button>
            <div className="digital-id-card-light" ref={idCardRef}>
               <div className="id-header-light">ALGON DC GCEK</div>
               <div className="id-body-light">
                 <img src="/club-logo.png" alt="Logo" className="id-club-logo" onError={(e) => e.target.style.display='none'}/>
                 <div className="id-photo-frame">
                   {member.profile_pic ? <img src={member.profile_pic} crossOrigin="anonymous" alt="Member" /> : <div className="initials">{member.name.charAt(0)}</div>}
                 </div>
                 <h2>{member.name}</h2>
                 <p className="role">Student Member</p>
                 <div className="id-meta">
                   <p><strong>ID:</strong> {member.user_id.slice(0, 8).toUpperCase()}</p>
                   <p><strong>Dept:</strong> {member.department}</p>
                   <p className="validity">Valid Till: {validTill}</p>
                 </div>
                 <div className="qr-box">
                    <QRCode value={verificationLink} size={64} fgColor="#000" bgColor="transparent"/>
                 </div>
               </div>
            </div>
            <button className="download-btn-modal" onClick={downloadImage}><Download size={18} /> Download ID Card</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;