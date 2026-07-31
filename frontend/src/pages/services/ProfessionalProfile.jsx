import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Briefcase, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '../../api/client';

const ProfessionalProfile = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get(`/services/${slug}`);
      setProfile(res.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center text-secondary-500">Loading professional profile...</div>;
  }

  if (!profile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <Briefcase className="w-16 h-16 text-secondary-300 mb-4" />
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Profile Not Found</h2>
        <p className="text-secondary-500 mt-2 mb-6">This professional may have removed their listing or it's currently inactive.</p>
        <Link to="/professionals" className="premium-button-secondary px-6 py-2 rounded-xl">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/professionals" className="inline-flex items-center gap-2 text-sm font-bold text-secondary-500 hover:text-primary-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{profile.business_name}</h1>
                  {profile.is_verified && (
                    <span className="text-emerald-500" title="Verified Professional"><CheckCircle className="w-6 h-6" /></span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold rounded-full">
                    {profile.category}
                  </span>
                  <span className="flex items-center gap-1 text-secondary-500">
                    <MapPin className="w-4 h-4" /> {profile.location ? `${profile.location}, ` : ''}{profile.city}, {profile.region}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-bold mb-2">About {profile.business_name}</h3>
              <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed whitespace-pre-wrap">
                {profile.bio || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Portfolio Gallery */}
          {profile.images && profile.images.length > 0 && (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Portfolio & Past Work</h3>
              
              <div className="rounded-2xl overflow-hidden bg-secondary-100 dark:bg-secondary-950 mb-4 aspect-video relative">
                <img 
                  src={`${import.meta.env.VITE_STORAGE_URL}/${profile.images[activeImage].path}`} 
                  alt="Portfolio Large" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {profile.images.map((img, idx) => (
                  <button 
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${activeImage === idx ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={`${import.meta.env.VITE_STORAGE_URL}/${img.path}`} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-xl sticky top-24">
            <h3 className="text-xl font-bold mb-6 text-center">Contact Professional</h3>
            
            <div className="space-y-4">
              {profile.whatsapp_number && (
                <a 
                  href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE59] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-transform active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </a>
              )}
              
              {profile.contact_number && (
                <a 
                  href={`tel:${profile.contact_number}`}
                  className="w-full py-4 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Call {profile.contact_number}
                </a>
              )}

              {!profile.whatsapp_number && !profile.contact_number && (
                <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl text-center text-sm text-secondary-500">
                  This professional has not provided public contact numbers.
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-secondary-100 dark:border-secondary-800 text-center">
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                Mention you found them on <span className="font-bold text-primary-500">SHOP VIOTOR</span> when you reach out!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
