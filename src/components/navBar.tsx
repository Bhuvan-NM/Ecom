import Cart from 'assets/icons/cart';
import Logo from 'assets/icons/logo';
import Profile from 'assets/icons/profile';
import Search from 'assets/icons/search';
import React from 'react';
import { useState } from 'react';

const NavBar = () => {

  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {
    setShowLogin(!showLogin);
  };

  const handleCloseLogin = (e: React.MouseEvent<HTMLDivElement>) => {

    if (e.target === e.currentTarget) {
      setShowLogin(false);
    }
  };




  return (
    <nav className='navBar'>

      <div className="login__background" onClick={handleCloseLogin}>&nbsp;</div>

      <form className="searchBar navBar__gridPos-1">
        <input type='text' className='searchBar__input' placeholder='Search'></input>
        <Search className={'searchBar__icon'} />
      </form>

      <div className="navBar__gridPos-2">
        <span className='navBar__item navBar__gridPos-2'>
          <Cart className={'navBar__icon'}/>
        </span>
        <span className='navBar__item navBar__gridPos-2' onClick = {handleLogin}>
          <Profile className={'navBar__icon login'} />
        </span>
      </div>
        
  
      <div className="navBar__gridPos-3">
        <Logo className={'logo'}/>
      </div>
    </nav>
  );
};

export default NavBar;
