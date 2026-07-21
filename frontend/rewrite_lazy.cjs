const fs = require('fs');
const content = fs.readFileSync('src/routes/AppRoutes.jsx', 'utf8');

const updated = content.replace(/import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+'([^']+)'/g, (match, name, path) => {
    if (path.includes('layouts') || name === 'Landing' || name === 'Routes' || name === 'Route' || name === 'Navigate') {
        return match; // Keep layouts, landing and router imports eager
    }
    return `const ${name} = React.lazy(() => import('${path}'));`;
});

// also wrap Routes with Suspense
const finalUpdate = updated.replace('<Routes>', '<React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>}>\n      <Routes>').replace('</Routes>', '</Routes>\n      </React.Suspense>');

fs.writeFileSync('src/routes/AppRoutes.jsx', finalUpdate);
