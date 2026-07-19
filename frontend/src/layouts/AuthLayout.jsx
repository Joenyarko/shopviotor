import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="text-center text-4xl font-extrabold text-secondary-900 dark:text-white tracking-wider block">
          SHOP <span className="text-primary-500">VIOTOR</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900 dark:text-white">
          Welcome to the Marketplace
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-secondary-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-secondary-200 dark:border-secondary-800 transition-colors">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
export { AuthLayout };
