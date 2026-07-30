import React, { useState, useEffect } from 'react';

const CategorySelector = ({ categories, value, onChange, required = false, className = '' }) => {
  const [mainId, setMainId] = useState('');
  const [subId, setSubId] = useState('');
  const [subSubId, setSubSubId] = useState('');

  // When 'value' changes externally, try to map it back to main/sub/subSub
  useEffect(() => {
    if (!value) {
      setMainId('');
      setSubId('');
      setSubSubId('');
      return;
    }
    
    // Find where this value lives in the tree
    for (const main of categories) {
      if (main.id === value || main.uuid === value) {
        setMainId(value); setSubId(''); setSubSubId(''); return;
      }
      if (main.children) {
        for (const sub of main.children) {
          if (sub.id === value || sub.uuid === value) {
            setMainId(main.id || main.uuid);
            setSubId(value);
            setSubSubId('');
            return;
          }
          if (sub.children) {
            for (const subsub of sub.children) {
              if (subsub.id === value || subsub.uuid === value) {
                setMainId(main.id || main.uuid);
                setSubId(sub.id || sub.uuid);
                setSubSubId(value);
                return;
              }
            }
          }
        }
      }
    }
  }, [value, categories]);

  const handleMainChange = (e) => {
    const newMain = e.target.value;
    setMainId(newMain);
    setSubId('');
    setSubSubId('');
    onChange(newMain);
  };

  const handleSubChange = (e) => {
    const newSub = e.target.value;
    setSubId(newSub);
    setSubSubId('');
    onChange(newSub || mainId);
  };

  const handleSubSubChange = (e) => {
    const newSubSub = e.target.value;
    setSubSubId(newSubSub);
    onChange(newSubSub || subId || mainId);
  };

  const activeMain = categories.find(c => c.id === mainId || c.uuid === mainId);
  const subCategories = activeMain?.children || [];
  
  const activeSub = subCategories.find(c => c.id === subId || c.uuid === subId);
  const subSubCategories = activeSub?.children || [];

  return (
    <div className="space-y-3 w-full">
      <select 
        required={required} 
        value={mainId} 
        onChange={handleMainChange} 
        className={className || "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"}
      >
        <option value="">Select Main Category</option>
        {categories.map(c => (
          <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.name}</option>
        ))}
      </select>

      {subCategories.length > 0 && (
        <select 
          value={subId} 
          onChange={handleSubChange} 
          className={className || "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"}
        >
          <option value="">-- Optional Subcategory --</option>
          {subCategories.map(c => (
            <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.name}</option>
          ))}
        </select>
      )}

      {subSubCategories.length > 0 && (
        <select 
          value={subSubId} 
          onChange={handleSubSubChange} 
          className={className || "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"}
        >
          <option value="">-- Optional Sub-subcategory --</option>
          {subSubCategories.map(c => (
            <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.name}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategorySelector;
