import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MessageCircleMore,
  MessagesSquare,
  Phone,
  Send,
  Smartphone,
  User,
  X,
  CheckCheck,
  MoreVertical,
  ChevronRight,
  Edit2,
  Eye
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { sendOutboundMessage } from '../../services/communicationService';

const initialBookings = [
  {
    id: '#BK-1001',
    customerName: 'Ravi Kumar',
    phoneNumber: '9876543210',
    channelPreference: 'WhatsApp',
    status: 'New',
    context: 'Laptop not turning on',
    updatedAt: 'May 26, 2024 10:00 AM',
    address: '23, Green Street, Indore, Madhya Pradesh - 452001',
    paymentType: 'Cash on Service',
    technician: 'Not Assigned',
    email: 'ravi.kumar@email.com'
  },
  {
    id: '#BK-1002',
    customerName: 'Priya Sharma',
    phoneNumber: '9988776655',
    channelPreference: 'SMS',
    status: 'Assigned',
    context: 'Slow Computer',
    updatedAt: 'May 26, 2024 11:30 AM',
    address: 'Vijay Nagar, Indore',
    paymentType: 'UPI',
    technician: 'Amit Singh',
    email: 'priya@email.com'
  },
  {
    id: '#BK-1003',
    customerName: 'Aman Verma',
    phoneNumber: '8877665544',
    channelPreference: 'WhatsApp',
    status: 'In Progress',
    context: 'Virus issue',
    updatedAt: 'May 26, 2024 01:00 PM',
    address: 'Palasia, Indore',
    paymentType: 'Card',
    technician: 'Rohit Kumar',
    email: 'aman@email.com'
  },
  {
    id: '#BK-1004',
    customerName: 'Neha Gupta',
    phoneNumber: '7766554433',
    channelPreference: 'WhatsApp',
    status: 'Completed',
    context: 'Printer Not Working',
    updatedAt: 'May 26, 2024 02:30 PM',
    address: 'Rajwada, Indore',
    paymentType: 'Paid Online',
    technician: 'Vikram Patel',
    email: 'neha@email.com'
  }
];

const templates = [
  {
    id: 'TPL-WELCOME',
    name: 'Welcome Message',
    type: 'welcome',
    content: 'Hi {{customer_name}},\n\nThank you for booking with {{company_name}}.\n\nYour request has been received and our technician will contact you shortly.\n\nRegards,\n{{company_name}} Team',
  },
  {
    id: 'TPL-FOLLOW',
    name: 'Follow-up Message',
    type: 'followup',
    content: 'Hi {{customer_name}},\n\nJust following up on your booking {{booking_id}}. Our technician is on the way!',
  },
  {
    id: 'TPL-SERVICE',
    name: 'Service Update',
    type: 'service_update',
    content: 'Hi {{customer_name}},\n\nUpdate on {{booking_id}}: Service is completed. Please review the invoice.',
  },
];

const initialHistory = [
  {
    id: 'MSG-7901',
    bookingId: '#BK-1001',
    channel: 'WhatsApp',
    recipient: 'Ravi Kumar',
    type: 'Welcome Message',
    preview: 'Hi Ravi Kumar, Thank you for booking...',
    status: 'Delivered',
    sentAt: '09:30 AM',
  },
];

const overviewData = [
  { name: '20 May', bookings: 90 },
  { name: '21 May', bookings: 110 },
  { name: '22 May', bookings: 100 },
  { name: '23 May', bookings: 130 },
  { name: '24 May', bookings: 120 },
  { name: '25 May', bookings: 140 },
  { name: '26 May', bookings: 155 },
];

const statusData = [
  { name: 'Pending', value: 32, color: '#3b82f6' },
  { name: 'Assigned', value: 28, color: '#f59e0b' },
  { name: 'In Progress', value: 26, color: '#8b5cf6' },
  { name: 'Completed', value: 44, color: '#10b981' },
];

const statusClass = {
  'New': 'badge badge-warning',
  'Assigned': 'badge badge-info',
  'In Progress': 'badge' ,
  'Completed': 'badge badge-success',
};

const messageStatusClass = {
  Delivered: 'badge badge-success',
  Queued: 'badge badge-warning',
  Failed: 'badge badge-danger',
};

const InstantMessagePage = () => {
  const [bookings] = useState(initialBookings);
  const [messageHistory, setMessageHistory] = useState(initialHistory);
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookings[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [channel, setChannel] = useState('WhatsApp');
  const [recipientMode, setRecipientMode] = useState('Customer');
  const [manualPhone, setManualPhone] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('Send Message');
  const [activeCenterTab, setActiveCenterTab] = useState('Activity');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) || bookings[0],
    [bookings, selectedBookingId]
  );
  
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || templates[0],
    [selectedTemplateId]
  );

  const loadTemplateIntoDraft = useCallback((templateId) => {
    if (!selectedBooking) return;
    const template = templates.find((entry) => entry.id === templateId) || templates[0];
    setSelectedTemplateId(template.id);
    const preparedText = template.content
      .replaceAll('{{customer_name}}', selectedBooking.customerName)
      .replaceAll('{{company_name}}', 'FixIT Computer Repair Services')
      .replaceAll('{{booking_id}}', selectedBooking.id);
    setMessageDraft(preparedText);
  }, [selectedBooking]);

  useEffect(() => {
    loadTemplateIntoDraft(selectedTemplateId);
  }, [loadTemplateIntoDraft, selectedTemplateId]);

  const sendMessage = async () => {
    const recipient = recipientMode === 'Customer' ? selectedBooking?.phoneNumber : manualPhone.trim();
    if (!recipient) {
      setNotice('Enter recipient phone number.');
      return;
    }
    if (!messageDraft.trim()) {
      setNotice('Message preview cannot be empty.');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendOutboundMessage({
        channel,
        recipientType: recipientMode,
        recipient,
        message: messageDraft.trim(),
        templateName: selectedTemplate.name,
        contextType: 'Booking',
      });

      const entry = {
        id: result.messageId || `MSG-${Math.floor(Math.random()*10000)}`,
        bookingId: selectedBooking.id,
        channel,
        recipient: selectedBooking.customerName,
        type: selectedTemplate.name,
        preview: messageDraft.trim().slice(0, 40) + '...',
        status: result.status || 'Delivered',
        sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessageHistory((current) => [entry, ...current]);
      setNotice(`Message sent successfully via ${channel}.`);
      setActiveRightTab('History');
      setIsPreviewOpen(false);
    } catch {
      setNotice('Failed to send message.');
    } finally {
      setIsSending(false);
      setTimeout(() => setNotice(''), 3000);
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {notice && (
        <div className="success-banner mb-4" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss message notice">
            <X size={16} />
          </button>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', padding: 0 }}>
            <div className="modal-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <h3 className="modal-title" style={{ fontSize: '1.1rem', margin: 0 }}>Message Preview</h3>
              <button className="icon-btn" onClick={() => setIsPreviewOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <div style={{ 
                background: '#dcf8c6', 
                padding: '10px 14px', 
                borderRadius: '12px', 
                borderTopRightRadius: '0',
                position: 'relative', 
                width: 'fit-content', 
                maxWidth: '90%', 
                marginLeft: 'auto',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#111', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                  {messageDraft}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#667781' }}>09:30 AM</span>
                  <CheckCheck size={14} color="#53bdeb" />
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                <strong style={{ color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Variables Mapping</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{`{customer_name}`}</span> <strong style={{ color: 'var(--text-main)' }}>{selectedBooking.customerName}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{`{company_name}`}</span> <strong style={{ color: 'var(--text-main)' }}>FixIT Computer Repair Services</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{`{booking_id}`}</span> <strong style={{ color: 'var(--text-main)' }}>{selectedBooking.id}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminPageHeader
        title="Instant Message Option"
        description="Bookings and messaging workspace with template-driven WhatsApp and SMS communication."
        breadcrumbs={['Admin', 'Admin Home Page', 'Instant Message Option']}
      />

      {/* TOP ROW: Dashboard & Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '1.5rem', width: '100%' }}>
        
        {/* ================================================== */}
        {/* 1️⃣ LEFT PANEL (Bookings Dashboard)                 */}
        {/* ================================================== */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Dashboard</h2>
            <select className="form-select sm" style={{ width: 'auto', backgroundColor: 'var(--bg-elevated)', border: 'none' }}>
              <option>May 20 - May 26, 2024</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</p>
              <h3 style={{ margin: '4px 0', fontSize: '1.1rem' }}>128</h3>
              <small className="text-success" style={{ fontWeight: 600 }}>+12%</small>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</p>
              <h3 style={{ margin: '4px 0', fontSize: '1.1rem' }}>32</h3>
              <small className="text-success" style={{ fontWeight: 600 }}>+8%</small>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</p>
              <h3 style={{ margin: '4px 0', fontSize: '1.1rem' }}>96</h3>
              <small className="text-success" style={{ fontWeight: 600 }}>+20%</small>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue</p>
              <h3 style={{ margin: '4px 0', fontSize: '1.1rem' }}>₹2.4L</h3>
              <small className="text-success" style={{ fontWeight: 600 }}>+15%</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '180px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Bookings Overview</h4>
              </div>
              <div style={{ height: '120px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overviewData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Job Status</h4>
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '90px', height: '90px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} innerRadius={30} outerRadius={45} dataKey="value" stroke="none">
                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>128</strong>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {statusData.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color, marginRight: '6px' }}></div>
                      <span style={{ flex: 1 }}>{s.name}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Recent Bookings</h4>
              <button className="btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="leads-table" style={{ fontSize: '0.8rem', width: '100%', minWidth: '400px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)' }}>
                    <th style={{ paddingBottom: '0.5rem', textAlign: 'left', fontWeight: 500 }}>ID</th>
                    <th style={{ paddingBottom: '0.5rem', textAlign: 'left', fontWeight: 500 }}>Customer</th>
                    <th style={{ paddingBottom: '0.5rem', textAlign: 'left', fontWeight: 500 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr 
                      key={b.id} 
                      onClick={() => setSelectedBookingId(b.id)} 
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: selectedBookingId === b.id ? 'var(--bg-hover)' : 'transparent',
                        borderBottom: '1px solid var(--border-light)'
                      }}
                    >
                      <td style={{ padding: '0.6rem 0', fontWeight: 600 }}>{b.id}</td>
                      <td style={{ padding: '0.6rem 0', fontWeight: 600 }}>{b.customerName}</td>
                      <td style={{ padding: '0.6rem 0' }}><span className={statusClass[b.status]} style={{ border: 'none', background: 'transparent', padding: 0 }}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2️⃣ CENTER PANEL (Booking Details + Activity)      */}
        {/* ================================================== */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>Bookings / <span style={{ color: 'var(--text-main)' }}>{selectedBooking.id}</span></h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                {selectedBooking.customerName[0]}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{selectedBooking.customerName}</h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{selectedBooking.phoneNumber}</span>
                  <span>{selectedBooking.email}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Booking ID</span>
              <strong style={{ fontWeight: 600 }}>{selectedBooking.id}</strong>
              
              <span style={{ color: 'var(--text-muted)' }}>Date</span>
              <strong style={{ fontWeight: 600 }}>{selectedBooking.updatedAt}</strong>
              
              <span style={{ color: 'var(--text-muted)' }}>Problem</span>
              <strong style={{ fontWeight: 600 }}>{selectedBooking.context}</strong>
              
              <span style={{ color: 'var(--text-muted)' }}>Address</span>
              <strong style={{ fontWeight: 600, lineHeight: 1.4 }}>{selectedBooking.address}</strong>
              
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <div><span className={statusClass[selectedBooking.status] || 'badge badge-warning'}>{selectedBooking.status}</span></div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-muted)' }}>Actions</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" style={{ justifyContent: 'center', padding: '0.4rem' }}>Assign Tech</button>
                <button className="btn btn-sm" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', justifyContent: 'center', padding: '0.4rem' }} onClick={() => loadTemplateIntoDraft('TPL-WELCOME')}>Send Welcome</button>
                <button className="btn btn-sm" style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', justifyContent: 'center', padding: '0.4rem' }} onClick={() => loadTemplateIntoDraft('TPL-FOLLOW')}>Send Follow-up</button>
                <button className="btn btn-outline btn-sm" style={{ justifyContent: 'center', padding: '0.4rem' }}>Complete</button>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1rem', overflowX: 'auto' }}>
              {['Activity', 'Notes (0)', 'Messages (1)', 'Invoices (0)'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveCenterTab(tab)}
                  style={{ 
                    padding: '0.4rem 0', 
                    background: 'transparent', 
                    borderBottom: activeCenterTab === tab ? '2px solid var(--primary)' : '2px solid transparent', 
                    color: activeCenterTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeCenterTab === tab ? 600 : 500,
                    fontSize: '0.85rem',
                    marginBottom: '-1px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {activeCenterTab === 'Activity' && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative', borderLeft: '2px solid var(--border-light)', marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <li style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-10px', top: '0', background: 'var(--bg-card)', padding: '2px 0' }}><CheckCheck size={16} color="var(--primary)" /></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.85rem' }}>Booking created</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by Website</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedBooking.updatedAt}</span>
                      </div>
                    </div>
                  </li>
                  <li style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-10px', top: '0', background: 'var(--bg-card)', padding: '2px 0' }}><CheckCheck size={16} color="#10b981" /></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.85rem' }}>Welcome message sent</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by Admin</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10:15 AM</span>
                      </div>
                    </div>
                  </li>
                  <li style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-10px', top: '0', background: 'var(--bg-card)', padding: '2px 0' }}><User size={16} color="var(--primary)" /></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.85rem' }}>Technician assigned</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by Admin</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10:30 AM</span>
                      </div>
                    </div>
                  </li>
                </ul>
              )}
              
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', marginTop: 'auto' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>Customer Overview</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Bookings</span>
                    <strong style={{ fontSize: '0.9rem' }}>3</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Completed</span>
                    <strong style={{ fontSize: '0.9rem' }}>2</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Spent</span>
                    <strong style={{ fontSize: '0.9rem' }}>₹2,850</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3️⃣ BOTTOM ROW (Messaging System)                  */}
      {/* ================================================== */}
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem 0', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Messaging Control</h3>
          <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto' }}>
            {['Send Message', 'History', 'Templates'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveRightTab(tab)} 
                style={{ 
                  padding: '0 0 0.6rem', 
                  background: 'transparent', 
                  borderBottom: activeRightTab === tab ? '2px solid var(--primary)' : '2px solid transparent', 
                  color: activeRightTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: activeRightTab === tab ? 600 : 500,
                  fontSize: '0.85rem',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {activeRightTab === 'Send Message' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Message Template</label>
                  <select className="form-select sm" value={selectedTemplateId} onChange={e => loadTemplateIntoDraft(e.target.value)} style={{ padding: '0.6rem 1rem' }}>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Delivery Channel</label>
                  <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-elevated)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" name="channel" checked={channel === 'WhatsApp'} onChange={() => setChannel('WhatsApp')} style={{ margin: 0, width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> 
                      <span>WhatsApp</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" name="channel" checked={channel === 'SMS'} onChange={() => setChannel('SMS')} style={{ margin: 0, width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> 
                      <span>SMS</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0, height: '100%' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Recipient Configuration</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px', height: 'calc(100% - 1.5rem)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" name="recipient" checked={recipientMode === 'Customer'} onChange={() => setRecipientMode('Customer')} style={{ margin: '3px 0 0', width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> 
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Associated Customer</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{selectedBooking.customerName} ({selectedBooking.phoneNumber})</span>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" name="recipient" checked={recipientMode === 'Phone Number'} onChange={() => setRecipientMode('Phone Number')} style={{ margin: '3px 0 0', width: '16px', height: '16px', accentColor: 'var(--primary)' }} /> 
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Custom Phone Number</span>
                        {recipientMode === 'Phone Number' && (
                          <div style={{ marginTop: '0.5rem', width: '100%' }}>
                            <input className="form-input sm" type="text" value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder="Enter mobile number..." style={{ width: '100%' }} />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setIsPreviewOpen(true)} style={{ padding: '0.75rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <Eye size={18} /> View Message Preview
                </button>
                <button className="btn btn-primary" onClick={sendMessage} disabled={isSending} style={{ padding: '0.75rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <Send size={18} /> Send Message Now
                </button>
              </div>

            </div>
          )}

          {activeRightTab === 'History' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {messageHistory.map(m => (
                <div key={m.id} style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${m.status === 'Delivered' ? '#10b981' : '#f59e0b'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{m.type}</strong>
                    <span className={messageStatusClass[m.status] || 'badge badge-info'} style={{ fontSize: '0.7rem' }}>{m.status}</span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.preview}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {m.channel === 'WhatsApp' ? <Smartphone size={12} /> : <Phone size={12} />} {m.channel}
                    </span>
                    <span>{m.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeRightTab === 'Templates' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {templates.map(t => (
                <div key={t.id} style={{ border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: '8px', background: 'var(--bg-elevated)', position: 'relative' }}>
                  <button className="icon-btn" style={{ position: 'absolute', top: '12px', right: '12px' }}><Edit2 size={14} /></button>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>{t.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{t.content}</p>
                </div>
              ))}
              <button className="btn btn-outline" style={{ borderStyle: 'dashed', fontSize: '0.9rem', padding: '0.75rem', height: '100%', minHeight: '120px' }}>+ Add New Template</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default InstantMessagePage;
