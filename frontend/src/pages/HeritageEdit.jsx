import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { heritageAPI } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useToast } from '../components/ui/ToastProvider';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const HeritageEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    historical_overview: '',
    cultural_significance: '',
    best_time_to_visit: '',
  });
  const [position, setPosition] = useState([10.8505, 76.2711]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [newPhotoPreview, setNewPhotoPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHeritage();
  }, [id]);

  const fetchHeritage = async () => {
    try {
      const response = await heritageAPI.getById(id);
      const site = response.data;
      
      setFormData({
        name: site.name || '',
        description: site.description || '',
        short_description: site.short_description || '',
        historical_overview: site.historical_overview || '',
        cultural_significance: site.cultural_significance || '',
        best_time_to_visit: site.best_time_to_visit || '',
      });

      // Parse location
      if (site.location_map) {
        const coords = site.location_map.split(',').map(Number);
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          setPosition(coords);
        }
      }

      // Set existing photos
      setExistingPhotos(site.photos || []);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to load heritage site');
      navigate('/heritage');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotoFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPhotoPreview(previews);
  };

  const handleDeleteExistingPhoto = async (photoId) => {
    try {
      await heritageAPI.deletePhoto(id, photoId);
      setExistingPhotos(existingPhotos.filter(p => p.id !== photoId));
      showSuccess('Photo deleted');
    } catch (err) {
      showError('Failed to delete photo');
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    if (!response.ok) throw new Error('Upload failed');
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        location_map: `${position[0]},${position[1]}`,
      };
      
      await heritageAPI.update(id, updateData);

      // Upload new photos
      if (newPhotoFiles.length > 0) {
        for (const file of newPhotoFiles) {
          try {
            const url = await uploadToCloudinary(file);
            await heritageAPI.addPhoto(id, url);
          } catch (uploadErr) {
            console.error('Photo upload failed:', uploadErr);
          }
        }
      }

      showSuccess('Heritage site updated successfully!');
      setTimeout(() => {
        navigate(`/heritage/${id}`, { state: { refresh: Date.now() } });
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update heritage site';
      showError(errorMsg);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-zinc-400 text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/heritage/${id}`)}
            className="mb-6 flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-2">
            Edit Heritage Site
          </h1>
          <p className="text-lg text-zinc-600">
            Update heritage information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Basic Information</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Site Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Short Description</label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Historical Overview</label>
                <textarea
                  name="historical_overview"
                  value={formData.historical_overview}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Cultural Significance</label>
                <textarea
                  name="cultural_significance"
                  value={formData.cultural_significance}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Best Time to Visit</label>
                <input
                  type="text"
                  name="best_time_to_visit"
                  value={formData.best_time_to_visit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Location *</h2>
            <p className="text-sm text-zinc-600 mb-4">Click on the map to update the location</p>
            <div className="h-96 rounded-xl overflow-hidden border border-zinc-300">
              <MapContainer
                center={position}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            <p className="text-sm text-zinc-500 mt-3">
              Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>

          {/* Photos */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Photos</h2>
            
            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-700 mb-3">Current Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.image_url}
                        alt="Heritage"
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingPhoto(photo.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Photos */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">Add New Photos</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:text-white file:cursor-pointer hover:file:bg-zinc-800"
              />
              {newPhotoPreview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {newPhotoPreview.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate(`/heritage/${id}`)}
              className="w-full sm:flex-1 px-6 py-3 sm:py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 px-6 py-3 sm:py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default HeritageEdit;
