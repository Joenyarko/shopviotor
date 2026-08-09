import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Star, Filter } from 'lucide-react';
import apiClient from '../../api/client';
import HeroBanner from '../../components/marketing/HeroBanner';

const ProfessionalsDirectory = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiClient.get('/services/categories');
        setCategories(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [categoryFilter]);

  const fetchProfessionals = async (search = '') => {
    setLoading(true);
    try {
      let url = '/services?';
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      
      const res = await apiClient.get(url);
      setProfessionals(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProfessionals(searchTerm);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroBanner position="atu_hero" fallbackContent={
        <div className="bg-primary-500 py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-secondary-900 tracking-tight">Hire Local Professionals</h1>
            <p className="text-secondary-800 text-lg font-medium">Find the best services and skilled experts in your area. From beauty to home repair, we've got you covered.</p>
            
            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="What service do you need?" 
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-secondary-900/50 text-lg shadow-xl"
                />
              </div>
              <button type="submit" className="px-8 py-4 bg-secondary-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-xl">
                Search
              </button>
            </form>
          </div>
        </div>
      } />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-secondary-900 p-6 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Filter className="w-5 h-5" /> Categories</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setCategoryFilter('')}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === '' ? 'bg-primary-500 text-white' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
              >
                All Services
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-primary-500 text-white' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white dark:bg-secondary-900 rounded-2xl h-80 animate-pulse border border-secondary-200 dark:border-secondary-800"></div>
              ))}
            </div>
          ) : professionals.length === 0 ? (
            <div className="bg-white dark:bg-secondary-900 rounded-2xl p-12 text-center border border-secondary-200 dark:border-secondary-800">
              <Briefcase className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">No professionals found</h3>
              <p className="text-secondary-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {professionals.map(pro => (
                <Link key={pro.uuid} to={`/professionals/${pro.slug}`} className="group bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500 transition-all flex flex-col">
                  <div className="h-48 overflow-hidden bg-secondary-100 dark:bg-secondary-800 relative">
                    {pro.images?.length > 0 ? (
                      <img src={pro.images[0].path.startsWith('http') ? pro.images[0].path : `${import.meta.env.VITE_STORAGE_URL}/${pro.images[0].path}`} alt={pro.business_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-12 h-12 text-secondary-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-600 shadow-sm">
                      {pro.category}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-bold text-lg text-secondary-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">{pro.business_name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-secondary-500 mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{pro.city || 'Anywhere'}, {pro.region}</span>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-3 line-clamp-2 flex-grow">
                      {pro.bio || 'Professional service provider ready to assist you.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsDirectory;
