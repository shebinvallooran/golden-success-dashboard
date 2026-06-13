import React, { useState, useEffect, useRef } from 'react';
import { quoteAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchableSelect from '../components/SearchableSelect/SearchableSelect';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Search, Trash2, Eye, Mail, Phone, Calendar, Building, Package, ChevronDown } from 'lucide-react';

const StatusDropdown = ({ value, onChange, disabled, height = '28px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: 'pending', label: 'Pending', style: { backgroundColor: '#fdf6b2', color: '#723b13', border: '1px solid #fce96f' } },
    { value: 'contacted', label: 'Contacted', style: { backgroundColor: '#e1effe', color: '#1e429f', border: '1px solid #c3ddfd' } },
    { value: 'resolved', label: 'Resolved', style: { backgroundColor: '#def7ec', color: '#03543f', border: '1px solid #bdf5db' } },
  ];

  const currentOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...currentOption.style,
          padding: '4px 8px 4px 12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          borderRadius: '9999px',
          height: height,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid transparent',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span>{currentOption.label}</span>
        <ChevronDown size={14} style={{ opacity: 0.8 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          marginTop: '4px',
          left: '0',
          zIndex: 100,
          minWidth: '120px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--gray-200)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                backgroundColor: opt.value === value ? 'var(--primary-50)' : 'transparent',
                color: opt.value === value ? 'var(--primary-700)' : 'var(--gray-700)',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) {
                  e.target.style.backgroundColor = 'var(--gray-100)';
                }
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState({ isOpen: false, enquiry: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, enquiry: null });
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await quoteAPI.getQuotes();
      if (response.data && response.data.success) {
        setEnquiries(response.data.data || []);
      } else {
        toast.error('Failed to parse enquiries response');
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to fetch enquiries from server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (enquiry) => {
    try {
      const response = await quoteAPI.deleteQuote(enquiry.id);
      if (response.data && response.data.success) {
        toast.success('Enquiry deleted successfully');
        setDeleteModal({ isOpen: false, enquiry: null });
        fetchEnquiries();
      } else {
        toast.error('Failed to delete enquiry');
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('An error occurred while deleting the enquiry');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingStatusId(id);
      const response = await quoteAPI.updateQuoteStatus(id, newStatus);
      if (response.data && response.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        if (viewModal.isOpen && viewModal.enquiry && viewModal.enquiry.id === id) {
          setViewModal(prev => ({ ...prev, enquiry: { ...prev.enquiry, status: newStatus } }));
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred while updating status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filter logic
  const filteredEnquiries = enquiries.filter(enquiry => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      enquiry.name.toLowerCase().includes(term) ||
      enquiry.email.toLowerCase().includes(term) ||
      enquiry.phone.toLowerCase().includes(term) ||
      (enquiry.company && enquiry.company.toLowerCase().includes(term)) ||
      (enquiry.product_name && enquiry.product_name.toLowerCase().includes(term));
    
    const matchesStatus = statusFilter === '' || enquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title">Business Enquiries</h1>
              <p className="page-description">
                Monitor and manage client enquiries and quote requests submitted through the frontend contact form.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters above the table card, aligned to the end */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 'var(--space-3)', 
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap'
        }}>
          {/* Clear Filters Button */}
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="btn btn-secondary btn-sm"
              style={{ height: '40px', padding: '0 var(--space-4)' }}
            >
              Clear Filters
            </button>
          )}

          {/* Search Input */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: 'var(--space-3)', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--gray-400)',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 'var(--space-10)', height: '40px' }}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ width: '200px' }}>
            <SearchableSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'resolved', label: 'Resolved' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              searchable={false}
            />
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="card">
          {loading ? (
            <LoadingSpinner message="Loading enquiries..." />
          ) : filteredEnquiries.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sender Info</th>
                    <th>Product & Qty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                          <Calendar size={14} style={{ color: 'var(--gray-500)' }} />
                          {formatDate(enquiry.created_at)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--gray-900)' }}>{enquiry.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> {enquiry.email}
                          </div>
                          {enquiry.phone && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> {enquiry.phone}
                            </div>
                          )}
                          {enquiry.company && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Building size={12} /> {enquiry.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontWeight: '500', color: 'var(--gray-850)' }}>{enquiry.product_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                            Quantity: <strong>{enquiry.quantity}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <StatusDropdown
                            value={enquiry.status}
                            onChange={(newStatus) => handleStatusChange(enquiry.id, newStatus)}
                            disabled={updatingStatusId === enquiry.id}
                            height="28px"
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setViewModal({ isOpen: true, enquiry })}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px' }}
                            title="View Message"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, enquiry })}
                            className="btn btn-danger"
                            style={{ padding: '6px 10px' }}
                            title="Delete Enquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Mail size={48} style={{ color: 'var(--gray-300)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.2rem', color: 'var(--gray-600)' }}>
                {searchTerm || statusFilter ? 'No enquiries match your search filters.' : 'No enquiries found.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Enquiry Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, enquiry: null })}
        title="Enquiry Details"
        maxWidth="750px"
      >
        {viewModal.enquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header info */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--gray-200)', 
              paddingBottom: 'var(--space-4)',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Initials Avatar */}
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 10px rgba(4, 195, 154, 0.2)'
                }}>
                  {viewModal.enquiry.name ? viewModal.enquiry.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--gray-900)', margin: '0' }}>
                    {viewModal.enquiry.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {viewModal.enquiry.company && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={14} /> {viewModal.enquiry.company}
                      </span>
                    )}
                    <span style={{ fontSize: '0.825rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {formatDate(viewModal.enquiry.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gray-50)', padding: '6px 12px', borderRadius: '30px', border: '1px solid var(--gray-200)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gray-600)' }}>Status:</span>
                <StatusDropdown
                  value={viewModal.enquiry.status}
                  onChange={(newStatus) => handleStatusChange(viewModal.enquiry.id, newStatus)}
                  disabled={updatingStatusId === viewModal.enquiry.id}
                  height="28px"
                />
              </div>
            </div>

            {/* Split Info Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {/* Card 1: Contact Details */}
              <div style={{ 
                border: '1px solid var(--gray-200)', 
                borderRadius: '12px', 
                padding: '16px',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={16} className="text-primary" style={{ color: 'var(--primary-500)' }} /> Contact Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: '600' }}>Email Address</span>
                    <div style={{ marginTop: '2px' }}>
                      <a href={`mailto:${viewModal.enquiry.email}`} style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>
                        {viewModal.enquiry.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: '600' }}>Phone Number</span>
                    <div style={{ marginTop: '2px', fontSize: '0.95rem', color: 'var(--gray-900)', fontWeight: '500' }}>
                      {viewModal.enquiry.phone ? (
                        <a href={`tel:${viewModal.enquiry.phone}`} style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>
                          {viewModal.enquiry.phone}
                        </a>
                      ) : <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>N/A</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Enquiry Details */}
              <div style={{ 
                border: '1px solid var(--gray-200)', 
                borderRadius: '12px', 
                padding: '16px',
                backgroundColor: 'white',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} className="text-primary" style={{ color: 'var(--primary-500)' }} /> Quote Request Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: '600' }}>Requested Product</span>
                    <div style={{ marginTop: '2px', fontSize: '0.95rem', color: 'var(--gray-900)', fontWeight: '600' }}>
                      {viewModal.enquiry.product_name}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: '600' }}>Requested Quantity</span>
                    <div style={{ marginTop: '2px' }}>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: '700', 
                        color: 'var(--primary-700)',
                        backgroundColor: 'var(--primary-50)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--primary-100)'
                      }}>
                        {viewModal.enquiry.quantity} pcs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Details */}
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-4)' }}>
              <div style={{ color: 'var(--gray-800)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} className="text-primary" style={{ color: 'var(--primary-500)' }} /> Message Body
              </div>
              <div style={{
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '0.95rem',
                color: 'var(--gray-800)',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                fontFamily: 'inherit'
              }}>
                {viewModal.enquiry.message || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>No message provided by client.</span>}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 'var(--space-3)', 
              borderTop: '1px solid var(--gray-200)', 
              paddingTop: 'var(--space-4)', 
              marginTop: 'var(--space-2)' 
            }}>
              <button
                onClick={() => setViewModal({ isOpen: false, enquiry: null })}
                className="btn btn-secondary"
                style={{ borderRadius: '30px', padding: '8px 20px', fontSize: '0.9rem', fontWeight: '600' }}
              >
                Close
              </button>
              <a
                href={`mailto:${viewModal.enquiry.email}?subject=Re: Golden Success Enquiry - ${viewModal.enquiry.product_name}`}
                className="btn btn-primary"
                style={{ 
                  borderRadius: '30px', 
                  padding: '8px 20px', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'white',
                  background: 'var(--primary-500)'
                }}
              >
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, enquiry: null })}
        title="Confirm Delete"
      >
        {deleteModal.enquiry && (
          <div>
            <p style={{ marginBottom: 'var(--space-2)', fontSize: '1.05rem' }}>
              Are you sure you want to delete the enquiry from <strong>{deleteModal.enquiry.name}</strong>?
            </p>
            <p style={{ color: 'var(--error-600)', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-6)' }}>
              This will permanently delete this record from the database. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setDeleteModal({ isOpen: false, enquiry: null })}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.enquiry)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnquiryList;
