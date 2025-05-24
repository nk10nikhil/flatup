'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Trash2,
  LogOut,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import toast from 'react-hot-toast';

export default function Settings() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    bio: '',
    image: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [notifications, setNotifications] = useState({
    emailInquiries: true,
    emailMarketing: false,
    pushInquiries: true,
    pushMarketing: false,
  });

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        bio: '',
        image: session.user.image || '',
      });
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        // Update the session
        await update({
          name: profileData.name,
          image: profileData.image,
        });
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'profiles');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setProfileData(prev => ({ ...prev, image: data.url }));
        toast.success('Profile image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      });

      if (response.ok) {
        toast.success('Notification preferences updated');
      } else {
        toast.error('Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Notification update error:', error);
      toast.error('Failed to update notification preferences');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        signOut({ callbackUrl: '/' });
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <tab.icon className="mr-3 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profileData.image ? (
                        <img
                          src={profileData.image}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90">
                        <Camera className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Profile Photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a profile photo to help others recognize you
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="input pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="input pl-10 bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="input pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                          className="input pl-10"
                          placeholder="Enter your city"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="input w-full"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="input w-full resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Security Settings</h2>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="input pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="input pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="input pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">New Inquiries</span>
                          <p className="text-sm text-muted-foreground">Get notified when someone shows interest in your listings</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailInquiries}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailInquiries: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">Marketing Updates</span>
                          <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailMarketing}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailMarketing: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-4">Push Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">New Inquiries</span>
                          <p className="text-sm text-muted-foreground">Get instant notifications for new inquiries</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushInquiries}
                          onChange={(e) => setNotifications(prev => ({ ...prev, pushInquiries: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground">Marketing Updates</span>
                          <p className="text-sm text-muted-foreground">Receive push notifications for promotions</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushMarketing}
                          onChange={(e) => setNotifications(prev => ({ ...prev, pushMarketing: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNotificationUpdate}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Danger Zone</h2>
                
                <div className="space-y-6">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="btn bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Sign Out</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign out of your account on this device.
                    </p>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
