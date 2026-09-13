import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, Users, MessageSquare, Plus, Edit, Trash2, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { api, type Product, type Meeting, type User, type Order } from '../lib/api';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Active tab: 'meetings' | 'products' | 'orders' | 'contacts'
  const [activeTab, setActiveTab] = useState<'meetings' | 'products' | 'orders' | 'contacts'>('meetings');

  // Data States
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Meeting Status Update Modal State
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | null>(null);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Check admin auth
  useEffect(() => {
    const raw = localStorage.getItem('kala_user_profile');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const user: User = JSON.parse(raw);
      if (user.role !== 'ADMIN') {
        navigate('/account');
        return;
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // Load data for all tabs
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [mRes, pRes, oRes, cRes] = await Promise.allSettled([
        api.getMeetings(),
        api.getProducts(),
        api.getOrders(),
        api.getContacts()
      ]);

      if (mRes.status === 'fulfilled') setMeetings(mRes.value.meetings);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.products);
      if (oRes.status === 'fulfilled') setOrders(oRes.value.orders);
      if (cRes.status === 'fulfilled') setContacts(cRes.value.contacts || []);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Meeting Status Actions
  const handleUpdateMeetingStatus = async () => {
    if (!selectedMeeting || !pendingStatusChange) return;

    try {
      await api.updateMeetingStatus(selectedMeeting.id, pendingStatusChange, meetingNotes);
      setActionMessage(`Meeting ${selectedMeeting.customerName} set to ${pendingStatusChange}. Customer notification triggered.`);
      setSelectedMeeting(null);
      setPendingStatusChange(null);
      setMeetingNotes('');
      refreshData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  // Product Toggle Stock / Sold Out
  const handleToggleProductStock = async (product: Product) => {
    const nextSoldOut = !product.isSoldOut;
    try {
      await api.toggleProductStock(product.id, {
        isSoldOut: nextSoldOut,
        inStock: !nextSoldOut
      });
      refreshData();
      setActionMessage(`Updated stock status for ${product.name}`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed updating stock status.');
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      refreshData();
      setActionMessage(`Product "${name}" deleted.`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed deleting product.');
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
        setActionMessage(`Product "${editingProduct.name}" updated successfully.`);
      } else {
        await api.createProduct(editingProduct);
        setActionMessage(`Product "${editingProduct.name}" created successfully.`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      refreshData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed saving product.');
    }
  };

  const pendingMeetingsCount = meetings.filter((m) => m.status === 'PENDING').length;
  const confirmedMeetingsCount = meetings.filter((m) => m.status === 'CONFIRMED').length;

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-kala-emerald dark:text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-kala-emerald dark:text-emerald-400">
                KALA Control Center
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-black uppercase text-foreground mt-1">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  category: 'Apparel',
                  subCategory: 'T-Shirts',
                  designCategory: 'Streetwear',
                  description: '',
                  price: 899,
                  image: '/images/Streetwear 01.png',
                  inStock: true,
                  isSoldOut: false,
                  availableSizes: ['S', 'M', 'L', 'XL'],
                  availableColors: ['Black', 'White']
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-kala-emerald text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-kala-emerald/90 transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionMessage && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-mid text-xs font-mono uppercase mb-2">
              <span>Pending Meetings</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="font-serif text-3xl font-black text-foreground">{pendingMeetingsCount}</p>
            <p className="text-[11px] text-mid mt-1">Requires admin review</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-mid text-xs font-mono uppercase mb-2">
              <span>Confirmed Meetings</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="font-serif text-3xl font-black text-foreground">{confirmedMeetingsCount}</p>
            <p className="text-[11px] text-mid mt-1">Upcoming consultations</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-mid text-xs font-mono uppercase mb-2">
              <span>Catalog Products</span>
              <Package className="w-4 h-4 text-kala-emerald" />
            </div>
            <p className="font-serif text-3xl font-black text-foreground">{products.length}</p>
            <p className="text-[11px] text-mid mt-1">Active in shop</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-mid text-xs font-mono uppercase mb-2">
              <span>Inquiries</span>
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <p className="font-serif text-3xl font-black text-foreground">{contacts.length}</p>
            <p className="text-[11px] text-mid mt-1">Contact messages</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-border mt-10 pb-2 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          {[
            { id: 'meetings', label: `Meetings (${meetings.length})`, icon: Calendar },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Users },
            { id: 'contacts', label: `Inquiries (${contacts.length})`, icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-kala-emerald text-white'
                    : 'bg-card border border-border text-mid hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: MEETINGS MANAGEMENT */}
        {activeTab === 'meetings' && (
          <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Consultation Meeting Requests</h3>
                <p className="text-xs text-mid">
                  Review customer slot requests. Confirming or cancelling triggers automated notification emails.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background/80 border-b border-border text-mid font-mono uppercase text-[10.5px]">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {meetings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-mid">
                        No meeting requests logged in database yet.
                      </td>
                    </tr>
                  ) : (
                    meetings.map((m) => (
                      <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-foreground">{m.customerName}</p>
                          <p className="text-[11px] text-mid">{m.companyName || 'Individual'}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">{m.customerEmail}</p>
                          <a href={`https://wa.me/91${m.phone}`} target="_blank" rel="noreferrer" className="text-kala-emerald font-semibold">
                            {m.phone}
                          </a>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-foreground">{m.date}</p>
                          <p className="font-mono text-mid">{m.time}</p>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="font-semibold text-foreground truncate">{m.purpose}</p>
                          {m.message && <p className="text-mid text-[11px] truncate">{m.message}</p>}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                              m.status === 'CONFIRMED'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : m.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-red-500/15 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {m.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedMeeting(m);
                                    setPendingStatusChange('CONFIRMED');
                                    setMeetingNotes('Confirmed. Video call details will be dispatched on WhatsApp.');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold uppercase hover:bg-emerald-700 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedMeeting(m);
                                    setPendingStatusChange('CANCELLED');
                                    setMeetingNotes('Schedule conflict. Please book an alternative slot.');
                                  }}
                                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[11px] font-bold uppercase hover:bg-red-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {m.status === 'CONFIRMED' && (
                              <button
                                onClick={() => {
                                  setSelectedMeeting(m);
                                  setPendingStatusChange('COMPLETED');
                                  setMeetingNotes('Consultation completed successfully.');
                                }}
                                className="px-2.5 py-1 bg-card border border-border text-foreground rounded-lg text-[11px] font-bold uppercase hover:bg-black/5"
                              >
                                Mark Done
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Catalog & Stock Control</h3>
                <p className="text-xs text-mid">
                  Changes made here update the public website immediately (pricing, sizes, and SOLD OUT status).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background/80 border-b border-border text-mid font-mono uppercase text-[10.5px]">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-black/5 dark:bg-white/5 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-[11px] text-mid font-mono">{p.subCategory}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">{p.category}</span>
                        {p.designCategory && (
                          <p className="text-[11px] text-mid font-mono">{p.designCategory}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-foreground">₹{p.price}</p>
                        {p.salePrice && <p className="text-[10px] text-mid line-through">₹{p.salePrice}</p>}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleProductStock(p)}
                          className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                            p.isSoldOut
                              ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          }`}
                        >
                          {p.isSoldOut ? 'SOLD OUT (Click to Restock)' : 'IN STOCK (Click to Mark Sold Out)'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-black/5 text-foreground"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-red-500"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-6">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Direct Orders Record</h3>
            <p className="text-xs text-mid mb-6">
              Track customer order requests. (Standard custom printing conversions route via Google Form).
            </p>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-mid border border-dashed border-border rounded-xl">
                No direct web orders logged yet. Current orders are coming in via Google Form.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold">{o.customerName} &bull; ₹{o.subtotal}</p>
                      <p className="text-xs text-mid">{o.customerEmail} &bull; {o.phone}</p>
                    </div>
                    <span className="text-xs font-mono uppercase font-bold text-amber-500">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTACT REQUESTS */}
        {activeTab === 'contacts' && (
          <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-6">
            <h3 className="font-serif text-lg font-bold text-foreground mb-1">Inquiry Messages</h3>
            <p className="text-xs text-mid mb-6">
              General inquiries sent through the website contact page.
            </p>

            {contacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-mid border border-dashed border-border rounded-xl">
                No inquiry messages logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="p-4 border border-border rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{c.name} ({c.email})</span>
                      <span className="text-xs font-mono text-mid">{c.phone}</span>
                    </div>
                    <p className="text-xs font-semibold text-kala-emerald">{c.subject}</p>
                    <p className="text-xs text-mid">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEETING STATUS UPDATE MODAL */}
      {selectedMeeting && pendingStatusChange && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl font-bold uppercase text-foreground">
              Confirm Status Update
            </h3>
            <p className="text-xs text-mid">
              You are updating meeting for <strong>{selectedMeeting.customerName}</strong> ({selectedMeeting.date} at {selectedMeeting.time}) to <span className="font-bold text-kala-emerald">{pendingStatusChange}</span>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notes for Customer Email:
              </label>
              <textarea
                rows={3}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Add meeting link, WhatsApp call details, or reason for cancellation..."
                className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kala-emerald"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedMeeting(null);
                  setPendingStatusChange(null);
                }}
                className="px-4 py-2 border border-border text-mid hover:text-foreground text-xs font-bold uppercase rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMeetingStatus}
                className="px-5 py-2 bg-kala-emerald text-white text-xs font-bold uppercase rounded-lg shadow-sm"
              >
                Dispatch & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl font-bold uppercase text-foreground">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={editingProduct.category || 'Apparel'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Business Branding">Business Branding</option>
                    <option value="Merchandise">Merchandise</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Sub-Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.subCategory || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                    placeholder="e.g. Oversized T-Shirts, Carry Bags"
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">Image URL / Path</label>
                <input
                  type="text"
                  required
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="e.g. /images/Streetwear 01.png"
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isSoldOut || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isSoldOut: e.target.checked, inStock: !e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span className="font-bold text-red-500">Mark SOLD OUT</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="rounded text-kala-emerald focus:ring-kala-emerald"
                  />
                  <span className="font-bold">Mark Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-border text-mid uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-kala-emerald text-white uppercase font-bold rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
