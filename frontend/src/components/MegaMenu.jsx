import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const MegaMenu = ({ categories, closeMenu }) => {
  const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0] : null);

  if (!categories || categories.length === 0) {
    return (
      <div className="absolute left-0 mt-0 w-56 shadow-xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 z-50 py-4 text-center text-sm text-secondary-500">
        Loading categories...
      </div>
    );
  }

  return (
    <div 
      className="absolute left-0 top-full mt-0 shadow-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 z-50 flex"
      style={{ width: '800px', minHeight: '400px' }}
      onMouseLeave={closeMenu}
    >
      {/* Level 1: Main Categories Sidebar */}
      <div className="w-1/3 border-r border-secondary-200 dark:border-secondary-800 py-2 bg-secondary-50 dark:bg-secondary-850">
        {categories.map((cat) => (
          <div
            key={cat.id || cat.uuid}
            onMouseEnter={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
              activeCategory?.id === cat.id 
                ? 'bg-white dark:bg-secondary-900 text-primary-600 font-bold border-l-4 border-primary-500' 
                : 'text-secondary-700 dark:text-secondary-300 hover:bg-white dark:hover:bg-secondary-900 border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              {cat.icon && <span className="text-lg">{cat.icon}</span>}
              <span>{cat.name}</span>
            </div>
            {cat.children && cat.children.length > 0 && (
              <ChevronRight className="w-4 h-4 text-secondary-400" />
            )}
          </div>
        ))}
      </div>

      {/* Level 2 & 3: Mega Menu Content Area */}
      <div className="w-2/3 p-6 bg-white dark:bg-secondary-900 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {activeCategory ? (
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-secondary-200 dark:border-secondary-800 pb-2">
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                {activeCategory.icon && <span>{activeCategory.icon}</span>}
                {activeCategory.name}
              </h3>
              <Link 
                to={`/products?category=${activeCategory.slug || activeCategory.id}`} 
                onClick={closeMenu}
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                View all in {activeCategory.name} &rarr;
              </Link>
            </div>

            {activeCategory.children && activeCategory.children.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {activeCategory.children.map((subcat) => (
                  <div key={subcat.id || subcat.uuid} className="space-y-3">
                    <Link 
                      to={`/products?category=${subcat.slug || subcat.id}`}
                      onClick={closeMenu}
                      className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wider hover:text-primary-600 transition-colors block border-b border-secondary-100 dark:border-secondary-800 pb-1"
                    >
                      {subcat.name}
                    </Link>
                    
                    {subcat.children && subcat.children.length > 0 && (
                      <ul className="space-y-2">
                        {subcat.children.map((child) => (
                          <li key={child.id || child.uuid}>
                            <Link 
                              to={`/products?category=${child.slug || child.id}`}
                              onClick={closeMenu}
                              className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-500 transition-colors"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-secondary-500 dark:text-secondary-400 text-sm py-8 text-center">
                No subcategories found in {activeCategory.name}.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-secondary-400 text-sm">
            Hover over a category to see more
          </div>
        )}
      </div>
    </div>
  );
};

export default MegaMenu;
