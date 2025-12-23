import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; 
import { Search, Check, X, Copy, Save, Edit2, Trash2, Calendar, Phone, Briefcase } from 'lucide-react';
import './Admin.css';

const AdminMemberManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Track which row is being edited
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 1. Fetch Members
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // 2. VERIFY PAYMENT (Auto-sets Valid Till & Status)
  const handleVerify = async (userId) => {
    const confirm = window.confirm("Confirm payment? This will approve the user for 1 YEAR.");
    if (!confirm) return;

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const validDate = nextYear.toISOString().split('T')[0]; 

    const { error } = await supabase
      .from('members')
      .update({ 
        status: 'approved', 
        valid_till: validDate,
        role: 'member',
        position: 'Student Member'
      })
      .eq('user_id', userId);

    if (error) alert("Error verifying user.");
    else fetchMembers();
  };

  // 3. DELETE USER
  const handleDelete = async (userId) => {
    if(!window.confirm("Are you sure? This will delete the user permanently.")) return;

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('user_id', userId);

    if (error) alert("Error deleting user.");
    else fetchMembers();
  };

  // 4. START EDITING (Populate Form)
  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      department: member.department,
      year: member.year,
      phone: member.phone,
      duration: member.duration,
      valid_till: member.valid_till,
      payment_ref: member.payment_ref,
      status: member.status,
      position: member.position,
      role: member.role
    });
  };

  // 5. SAVE CHANGES
  const saveChanges = async (userId) => {
    const { error } = await supabase
      .from('members')
      .update(editForm) // Updates all editable fields
      .eq('user_id', userId);

    if (error) alert("Failed to save changes.");
    else {
      setEditingId(null);
      fetchMembers();
    }
  };

  // Helper: Handle Input Change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Helper: Copy Text
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- FILTER LOGIC ---
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.payment_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2>Member Management</h2>
        <div className="stats-badge">
          {members.filter(m => m.status === 'pending').length} Pending
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
         <div className="search-box">
           <Search size={18} className="search-icon" />
           <input 
             type="text" 
             placeholder="Search Name, Email, Payment Ref..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         <div className="filter-tabs">
            <button className={filterStatus === 'all' ? 'active' : ''} onClick={()=>setFilterStatus('all')}>All</button>
            <button className={filterStatus === 'pending' ? 'active' : ''} onClick={()=>setFilterStatus('pending')}>Pending</button>
            <button className={filterStatus === 'approved' ? 'active' : ''} onClick={()=>setFilterStatus('approved')}>Approved</button>
         </div>
      </div>

      <div className="table-container">
        {loading ? <p className="loading-text">Loading...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile (Read-Only Email)</th>
                <th>Academic & Contact</th>
                <th>Membership & Role</th>
                <th>Payment & Validity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const isEditing = editingId === member.id;
                
                return (
                  <tr key={member.id} className={member.status === 'pending' ? 'row-pending' : ''}>
                    
                    {/* 1. PROFILE (Image & Email NOT Editable) */}
                    <td>
                      <div className="member-cell">
                        {/* Member Logo / Avatar */}
                        {member.profile_pic ? (
                          <img src={member.profile_pic} alt="profile" className="table-avatar-img" />
                        ) : (
                          <div className="table-avatar">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div>
                          {isEditing ? (
                            <input 
                              name="name" 
                              value={editForm.name || ''} 
                              onChange={handleEditChange} 
                              className="edit-input" 
                              placeholder="Full Name"
                            />
                          ) : (
                            <strong>{member.name}</strong>
                          )}
                          {/* Email is never editable */}
                          <span className="sub-text">{member.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. ACADEMIC & CONTACT */}
                    <td>
                      <div className="details-stack">
                        {isEditing ? (
                          <>
                            <input name="department" value={editForm.department || ''} onChange={handleEditChange} className="edit-input" placeholder="Branch" />
                            <input name="year" value={editForm.year || ''} onChange={handleEditChange} className="edit-input" placeholder="Year" />
                            <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="edit-input" placeholder="Phone" />
                          </>
                        ) : (
                          <>
                            <span>{member.department} - {member.year}</span>
                            <div className="icon-row"><Phone size={12}/> {member.phone || "N/A"}</div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 3. MEMBERSHIP & ROLE */}
                    <td>
                      <div className="details-stack">
                        {isEditing ? (
                          <>
                            <select name="role" value={editForm.role || 'member'} onChange={handleEditChange} className="edit-input">
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="execom">Execom</option>
                            </select>
                            <input name="position" value={editForm.position || ''} onChange={handleEditChange} className="edit-input" placeholder="Position (e.g. Student Member)" />
                            <input name="duration" value={editForm.duration || ''} onChange={handleEditChange} className="edit-input" placeholder="Duration" />
                          </>
                        ) : (
                          <>
                            <span className={`role-badge ${member.role}`}>{member.role}</span>
                            <span className="sub-text">{member.position}</span>
                            {member.duration && <span className="sub-text small">({member.duration})</span>}
                          </>
                        )}
                      </div>
                    </td>

                    {/* 4. PAYMENT & VALIDITY */}
                    <td>
                      <div className="details-stack">
                         {isEditing ? (
                            <>
                              <input name="payment_ref" value={editForm.payment_ref || ''} onChange={handleEditChange} className="edit-input" placeholder="Ref ID" />
                              <input type="date" name="valid_till" value={editForm.valid_till || ''} onChange={handleEditChange} className="edit-input" />
                              <select name="status" value={editForm.status || 'pending'} onChange={handleEditChange} className="edit-input">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </>
                         ) : (
                            <>
                              <div className="tx-row">
                                <code className="tx-code">{member.payment_ref || "No Ref"}</code>
                                {member.payment_ref && <Copy size={12} className="copy-icon" onClick={() => copyToClipboard(member.payment_ref)}/>}
                              </div>
                              <div className="icon-row"><Calendar size={12}/> {member.valid_till || "No Date"}</div>
                              <span className={`status-dot ${member.status}`}>• {member.status}</span>
                            </>
                         )}
                      </div>
                    </td>

                    {/* 5. ACTIONS */}
                    <td>
                      <div className="action-row">
                        {isEditing ? (
                          <button className="btn-save" onClick={() => saveChanges(member.user_id)}>
                            <Save size={16}/> Save
                          </button>
                        ) : (
                          <>
                            {member.status === 'pending' ? (
                               <button className="btn-verify" onClick={() => handleVerify(member.user_id)} title="Approve">
                                  <Check size={16}/>
                               </button>
                            ) : (
                               <button className="btn-edit" onClick={() => startEditing(member)}>
                                  <Edit2 size={16}/>
                               </button>
                            )}
                            <button className="btn-reject" onClick={() => handleDelete(member.user_id)} title="Delete">
                               <Trash2 size={16}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMemberManager;