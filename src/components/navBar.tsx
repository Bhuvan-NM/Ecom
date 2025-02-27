import Cart from 'assets/icons/cart';
import Logo from 'assets/icons/logo';
import Profile from 'assets/icons/profile';
import Search from 'assets/icons/search';
import React from 'react';
import { useState } from 'react';

const NavBar = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);

  const toggleLoginBackground = () => {
    setIsLoginVisible(!isLoginVisible);
  };

  const closeLoginModal = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsLoginVisible(false);
    }
  };

  return (
    <nav className="navBar">
      {/* Login Background (Modal) */}
      {isLoginVisible && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeLoginModal}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <p>Enter your credentials here.</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setIsLoginVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form className="searchBar navBar__gridPos-1">
        <input 
          type="text" 
          className="searchBar__input" 
          placeholder="Search"
        />
        <Search className="searchBar__icon" />
      </form>

      {/* Navigation Items */}
      <div className="navBar__gridPos-2">
        <span className="navBar__item navBar__gridPos-2">
          <Cart className="navBar__icon" />
        </span>
        {/* Move onClick to <span> instead of <Profile /> */}
        <span 
          className="navBar__item navBar__gridPos-2 cursor-pointer" 
          onClick={toggleLoginBackground}
        >
          <Profile className="navBar__icon login" />
        </span>
      </div>

      {/* Logo */}
      <div className="navBar__gridPos-3">
        <Logo className="logo" />
      </div>
    </nav>
  );
};

export default NavBar;