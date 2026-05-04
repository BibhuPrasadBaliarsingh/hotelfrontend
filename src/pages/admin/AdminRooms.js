import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Spinner from '../../components/Spinner';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../services/api';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const AMENITIES_LIST = [
  'Free WiFi', 'Air Conditioning', 'Flat-screen TV', '4K Smart TV', 'Mini Fridge',
  'Minibar', 'Room Service', 'Safe', 'Balcony', 'Ocean View', 'Garden View',
  'Bathtub', 'Rainfall Shower', 'Jacuzzi', 'Butler Service', 'Kitchen',
  'Dining Room', 'Living Room', 'Private Pool', 'Pool Access', 'Airport Transfer',
  'Coffee Machine', 'Iron', 'Work Desk', 'Gym Access', 'Sea View',
];

const TYPE_STYLES = {
  Single:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Double:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Deluxe:  'bg-primary-500/10 text-primary-400 border-primary-500/20',
  Suite:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const emptyRoom = {
  name: '', type: 'Single', price: '', description: '',
  capacity: 2, size: 30, floor: 1,
  images: [],
  amenities: [],
  isAvailable: true,
};

function RoomModal({ room, onClose, onSave }) {
  const [form, setForm] = useState(room ? { ...room, images: room.images?.length ? room.images : [] } : { ...emptyRoom });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const toggleAmenity = (a) => {
    set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);
  };

  const removeImage = (index) => {
    const imgs = [...form.images];
    imgs.splice(index, 1);
    set('images', imgs);
  };

  const readFilesAsDataUrls = async (files) => {
    const readers = Array.from(files).map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    return Promise.all(readers);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      const uploaded = await readFilesAsDataUrls(files);
      set('images', [...form.images, ...uploaded]);
    } catch {
      toast.error('Failed to read uploaded images');
    } finally {
      e.target.value = '';
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        size: Number(form.size),
        floor: Number(form.floor),
        images: form.images.filter(Boolean),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-hotel-card border border-hotel-border rounded-2xl w-full max-w-2xl my-8 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-hotel-border">
          <div>
            <h2 className="font-serif text-xl text-white">{room ? 'Edit Room' : 'Add New Room'}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{room ? 'Update room details' : 'Fill in the details to add a new room'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Room Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Deluxe Ocean View" className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Room Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                {['Single', 'Double', 'Deluxe', 'Suite'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Price, Capacity, Size, Floor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Price / Night (INR) *</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="149" className={`input-field ${errors.price ? 'border-red-500/50' : ''}`} />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Capacity</label>
              <input type="number" min="1" max="20" value={form.capacity} onChange={e => set('capacity', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Size (m²)</label>
              <input type="number" min="0" value={form.size} onChange={e => set('size', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Floor</label>
              <input type="number" min="1" value={form.floor} onChange={e => set('floor', e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Describe the room, views, and unique features..." className={`input-field resize-none ${errors.description ? 'border-red-500/50' : ''}`} />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Images */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">Room Images</label>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <label className="btn-outline px-4 py-2 text-sm cursor-pointer rounded-xl">
                Upload images
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              <span className="text-gray-500 text-xs">You can upload multiple images. They are stored directly in MongoDB.</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {form.images.length === 0 && (
                <div className="col-span-full text-gray-500 text-sm">No images uploaded yet.</div>
              )}
              {form.images.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img src={img} alt={`Room ${i + 1}`} className="w-full h-24 object-cover" onError={e => { e.target.style.display = 'none'; }} />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs grid place-items-center hover:bg-black/80">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">Amenities ({form.amenities.length} selected)</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    form.amenities.includes(a)
                      ? 'bg-primary-900/40 border-primary-600/50 text-primary-300'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl">
            <div>
              <p className="text-white text-sm font-medium">Room Availability</p>
              <p className="text-gray-600 text-xs">Toggle to make room bookable</p>
            </div>
            <button type="button" onClick={() => set('isAvailable', !form.isAvailable)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form.isAvailable ? 'bg-green-600' : 'bg-white/15'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.isAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-hotel-border">
          <button onClick={onClose} className="btn-outline flex-1 py-3">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {room ? 'Updating...' : 'Creating...'}
              </span>
            ) : room ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | room object
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try { const res = await getRooms(); setRooms(res.data.rooms); }
    catch { toast.error('Failed to load rooms'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleSave = async (data) => {
    if (modal === 'add') {
      const res = await createRoom(data);
      setRooms(prev => [res.data.room, ...prev]);
      toast.success('Room created successfully!');
    } else {
      const res = await updateRoom(modal._id, data);
      setRooms(prev => prev.map(r => r._id === modal._id ? res.data.room : r));
      toast.success('Room updated!');
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteRoom(id);
      setRooms(prev => prev.filter(r => r._id !== id));
      toast.success('Room deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(null); setDeleteTarget(null); }
  };

  const filtered = rooms.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout title="Room Management" subtitle={`${rooms.length} rooms total`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search rooms by name or type..."
          className="input-field flex-1 text-sm" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field sm:w-40 text-sm">
          <option value="">All Types</option>
          {['Single', 'Double', 'Deluxe', 'Suite'].map(t => <option key={t}>{t}</option>)}
        </select>
        <button onClick={() => setModal('add')} className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap">
          + Add Room
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['Single', 'Double', 'Deluxe', 'Suite'].map(t => {
          const cnt = rooms.filter(r => r.type === t).length;
          return (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${typeFilter === t ? `${TYPE_STYLES[t]}` : 'border-white/10 text-gray-500 hover:border-white/20'}`}>
              {t} ({cnt})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hotel-border">
                  {['Room', 'Type', 'Price', 'Capacity', 'Status', 'Amenities', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-border">
                {filtered.map(room => (
                  <tr key={room._id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-hotel-border">
                          <img src={room.images?.[0]} alt={room.name} className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'; }} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{room.name}</p>
                          <p className="text-gray-600 text-xs">Floor {room.floor} · {room.size}m²</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge border text-xs ${TYPE_STYLES[room.type]}`}>{room.type}</span>
                    </td>
                    <td className="px-5 py-4 text-primary-400 font-bold">{formatINR(room.price)}<span className="text-gray-600 text-xs font-normal">/night</span></td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{room.capacity} guests</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${room.isAvailable ? 'dot-available' : 'dot-unavailable'}`} />
                        <span className={`text-xs font-medium ${room.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                          {room.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {room.amenities?.slice(0, 2).map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 bg-white/5 text-gray-500 rounded">{a}</span>
                        ))}
                        {room.amenities?.length > 2 && (
                          <span className="text-xs text-gray-600">+{room.amenities.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(room)}
                          className="text-xs px-3 py-1.5 border border-white/10 text-gray-400 rounded-lg hover:border-primary-500/50 hover:text-primary-400 transition-all">
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(room)} disabled={deleting === room._id}
                          className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/5 transition-all disabled:opacity-50">
                          {deleting === room._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-14 text-gray-500 text-sm">
                    {search || typeFilter ? 'No rooms match your filters.' : 'No rooms yet. Click "+ Add Room" to get started.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 modal-backdrop z-60 flex items-center justify-center p-4">
          <div className="bg-hotel-card border border-hotel-border rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden">
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-white font-semibold text-lg">Confirm Delete</h3>
                <p className="text-gray-400 text-sm mt-1">Are you sure you want to delete <span className="font-medium text-white">{deleteTarget.name}</span>? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 btn-outline py-3">
                  Cancel
                </button>
                <button type="button" onClick={() => handleDelete(deleteTarget._id)}
                  disabled={deleting === deleteTarget._id}
                  className="flex-1 btn-danger py-3 disabled:opacity-50">
                  {deleting === deleteTarget._id ? 'Deleting...' : 'Delete Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal !== null && (
        <RoomModal
          room={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
