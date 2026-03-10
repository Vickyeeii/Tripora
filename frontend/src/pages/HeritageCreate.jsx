import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ChangeMapView = ({ coords }) => {
  const map = useMapEvents({});
  React.useEffect(() => {
    map.setView(coords);
  }, [coords, map]);
  return null;
};

const HeritageCreate = () => {
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
  const [position, setPosition] = useState([10.8505, 76.2711]); // Kerala center
  const [manualLocation, setManualLocation] = useState({
    lat: '10.8505',
    lng: '76.2711'
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [rules, setRules] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, '']);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing. Check .env file and restart dev server.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed. Check your cloud name and upload preset in .env');
      }
      return data.secure_url;
    } catch (err) {
      throw new Error(err.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create heritage site first
      const heritageData = {
        ...formData,
        location_map: `${position[0]},${position[1]}`,
      };
      
      const response = await heritageAPI.create(heritageData);
      const siteId = response.data.id;

      // Upload photos to Cloudinary and add to heritage
      if (photoFiles.length > 0) {
        for (const file of photoFiles) {
          try {
            const url = await uploadToCloudinary(file);
            await heritageAPI.addPhoto(siteId, url);
          } catch (uploadErr) {
            console.error('Photo upload failed:', uploadErr);
            // Continue with other photos even if one fails
          }
        }
      }

      // Add rules
      for (const rule of rules) {
        if (rule.trim()) {
          await heritageAPI.addRule(siteId, rule);
        }
      }

      // Generate QR code
      await heritageAPI.generateQR(siteId);

      showSuccess('Heritage site created successfully!');
      setTimeout(() => {
        navigate(`/heritage/${siteId}`);
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' 
            ? err.response.data.detail 
            : JSON.stringify(err.response.data.detail))
        : err.message || 'Failed to create heritage site';
      showError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/heritage')}
            className="mb-6 flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-2">
            Add Heritage Site
          </h1>
          <p className="text-lg text-zinc-600">
            Share a cultural treasure with visitors
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
                  placeholder="e.g., Padmanabhaswamy Temple"
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
                  placeholder="Brief one-line description"
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
                  placeholder="Detailed description of the heritage site..."
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
                  placeholder="Historical background and significance..."
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
                  placeholder="Cultural importance and traditions..."
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
                  placeholder="e.g., October to March"
                />
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Location *</h2>
            <p className="text-sm text-zinc-600 mb-4">Click on the map or enter coordinates to select the location</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={manualLocation.lat}
                  onChange={(e) => {
                    const val = e.target.value;
                    setManualLocation({...manualLocation, lat: val});
                    if (val && !isNaN(parseFloat(val)) && manualLocation.lng && !isNaN(parseFloat(manualLocation.lng))) {
                      setPosition([parseFloat(val), parseFloat(manualLocation.lng)]);
                    }
                  }}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900"
                  placeholder="e.g. 10.8505"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={manualLocation.lng}
                  onChange={(e) => {
                    const val = e.target.value;
                    setManualLocation({...manualLocation, lng: val});
                    if (val && !isNaN(parseFloat(val)) && manualLocation.lat && !isNaN(parseFloat(manualLocation.lat))) {
                      setPosition([parseFloat(manualLocation.lat), parseFloat(val)]);
                    }
                  }}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900"
                  placeholder="e.g. 76.2711"
                />
              </div>
            </div>
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
                <ChangeMapView coords={position} />
                <LocationPicker 
                  position={position} 
                  setPosition={(newPos) => {
                    setPosition(newPos);
                    setManualLocation({
                      lat: newPos[0].toFixed(6),
                      lng: newPos[1].toFixed(6)
                    });
                  }} 
                />
              </MapContainer>
            </div>
            <p className="text-sm text-zinc-500 mt-3">
              Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>

          {/* Photos */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Photos</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:text-white file:cursor-pointer hover:file:bg-zinc-800"
            />
            {photoPreview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {photoPreview.map((url, index) => (
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

          {/* Safety Rules */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Visitor Guidelines</h2>
              <button
                type="button"
                onClick={addRule}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors text-sm"
              >
                Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-zinc-900"
                    placeholder="e.g., Remove footwear before entering"
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/heritage')}
              className="w-full sm:flex-1 px-6 py-3 sm:py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-6 py-3 sm:py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Creating...' : 'Create Heritage Site'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default HeritageCreate;
