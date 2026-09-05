import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, User, Camera, X, Mail, Phone, MapPin, Check, ImagePlus } from 'lucide-react';

/*
 * "Edit Profile" screen (mula sa Me page) — naka-save sa existing
 * customerInfo profile (localStorage per user).
 *
 * - Avatar photo: pwedeng kumuha ng larawan MULA SA DEVICE
 *   (file input accept="image/*"), mina-minimize para hindi
 *   mabigat sa localStorage, may remove option.
 * - Fields: Name, Email, Phone, Address.
 */
export const EditProfile: React.FC = () => {
  const { user, customerInfo, saveCustomerInfo, setPage, showToast } = useStore();

  const [name, setName] = useState(customerInfo?.name || user.username || '');
  const [email, setEmail] = useState(customerInfo?.email || '');
  const [phone, setPhone] = useState(customerInfo?.phone || '');
  const [address, setAddress] = useState(customerInfo?.address || '');
  const [avatar, setAvatar] = useState(customerInfo?.avatar || '');
  const [saveError, setSaveError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const inputBase =
    'w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white';

  const fieldLabel =
    'text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5';

  // I-compress ang photo gamit canvas para hindi sumagad sa localStorage.
  const processImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSaveError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image is too large. Please choose under 5MB.');
      return;
    }
    setSaveError('');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Center-crop sa SQUARE (gaya ng avatar), para lagi bilog at walang distortion.
        const MAX = 420;
        const srcSide = Math.min(img.width, img.height);
        const outSize = Math.round(srcSide * Math.min(1, MAX / srcSide));
        const sx = Math.round((img.width - srcSide) / 2);
        const sy = Math.round((img.height - srcSide) / 2);
        const canvas = document.createElement('canvas');
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, srcSide, srcSide, 0, 0, outSize, outSize);
        setAvatar(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Please enter your full name.');
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setSaveError('Please enter a valid email address.');
      return;
    }
    setSaveError('');
    saveCustomerInfo({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      ...(avatar ? { avatar } : {}),
    });
    showToast('Profile updated successfully!', 'success');
    setPage('me');
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-4 pb-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setPage('me')}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-center text-stone-700 dark:text-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white">Edit Profile</h1>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">Manage your account details</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar / photo from device */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 px-5 py-6 flex flex-col items-center">
          <div className="relative">
            {avatar ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-500/30 shadow-md shrink-0">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border-2 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
                <User className="w-12 h-12 text-indigo-500" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload photo"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center active:scale-90 transition-all border-2 border-white dark:border-stone-900"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImage(file);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-wider"
          >
            <ImagePlus className="w-4 h-4" />
            Upload photo from device
          </button>

          {avatar && (
            <button
              type="button"
              onClick={() => setAvatar('')}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-500"
            >
              <X className="w-3.5 h-3.5" />
              Remove photo
            </button>
          )}

          <p className="mt-3 text-[11px] text-stone-400 text-center px-6">
            JPG, PNG, or GIF. Photo is saved on this device only.
          </p>
        </div>

        {/* Fields */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden">
          <div className="p-4 space-y-2">
            <label className={fieldLabel}>
              <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={inputBase}
            />
          </div>

          <div className="p-4 space-y-2">
            <label className={fieldLabel}>
              <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputBase}
            />
          </div>

          <div className="p-4 space-y-2">
            <label className={fieldLabel}>
              <Phone className="w-3.5 h-3.5 text-indigo-500" /> Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9xx xxx xxxx"
              className={inputBase}
            />
          </div>

          <div className="p-4 space-y-2">
            <label className={fieldLabel}>
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House no., street, barangay, city"
              rows={2}
              className={inputBase + ' resize-none'}
            />
          </div>
        </div>

        {saveError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {saveError}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-black uppercase tracking-wider shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Check className="w-4 h-4" />
          Save Changes
        </button>
      </form>
    </div>
  );
};