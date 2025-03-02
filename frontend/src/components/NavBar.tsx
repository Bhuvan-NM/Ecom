import Cart from 'assets/icons/cart';
import Logo from 'assets/icons/logo';
import Profile from 'assets/icons/profile';
import Search from 'assets/icons/search';
import React from 'react';
import {motion} from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import LoginRegister from './LoginRegister';

const NavBar = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const profileRef = useRef<HTMLSpanElement | null>(null);
  const [profilePosition, setProfilePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLoginVisible || !profileRef.current) return; // ✅ Prevents running when modal is closing
  
    const rect = profileRef.current.getBoundingClientRect();
  
    setTimeout(() => {
      if (!isLoginVisible) return; // ✅ Ensures state doesn't update after unmounting
      setProfilePosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }, 0);
  }, [isLoginVisible]);

  return (
    <nav className="navBar">
      {/* Radial Background (Framer Motion) */}
      {isLoginVisible && (
        <motion.div
        className="login__background"
        initial={{
          clipPath: `circle(0px at ${profilePosition.x}px ${profilePosition.y}px)`,
        }}
        animate={{
          clipPath: `circle(150% at ${profilePosition.x}px ${profilePosition.y}px)`,
        }}
        exit={{
          clipPath: `circle(0px at ${profilePosition.x}px ${profilePosition.y}px)`,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onClick={() => setIsLoginVisible(false)} // ✅ Closes only when clicking outside
      >
        <LoginRegister setIsLoginVisible={setIsLoginVisible} />
        </motion.div>
      )}

      {/* Search Bar */}
      <form className="searchBar navBar__gridPos-1">
        <input type="text" className="searchBar__input" placeholder="Search" />
        <Search className="searchBar__icon" />
      </form>

      {/* Navigation Items */}
      <div className="navBar__gridPos-2">
        <span className="navBar__item navBar__gridPos-2">
          <Cart className="navBar__icon" />
        </span>
        <span
          ref={profileRef}
          className="navBar__item navBar__gridPos-2 cursor-pointer"
          onClick={() => setIsLoginVisible(true)}
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