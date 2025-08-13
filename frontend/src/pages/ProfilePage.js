// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import Button from '../components/Shared/Button';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Shared/Loading';
import { FaUserCircle } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const [formData, setFormData] = useState({ name: '', avatar_url: '' });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ 
          name: user.username || '',
          avatar_url: user.avatar_url || '' 
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      await updateProfile(user.id, { 
          username: formData.name, 
          avatar_url: formData.avatar_url 
      });
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account details and preferences.</p>
      </div>

      <div className="max-w-2xl">
        <div className="p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center mb-6">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                    <FaUserCircle className="w-20 h-20 text-gray-300" />
                )}
                <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-800">{user?.username}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                </div>
            </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
              <input type="text" name="avatar_url" id="avatar_url" value={formData.avatar_url} onChange={handleChange}
                className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://example.com/your-image.png" />
            </div>
            {successMessage && <p className="text-sm text-center text-green-600 bg-green-100 p-3 rounded-lg">{successMessage}</p>}
            <div className="pt-2 text-right">
              <Button type="submit" loading={loading} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
