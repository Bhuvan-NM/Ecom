import Cart from 'assets/cart';
import Logo from 'assets/logo';
import Profile from 'assets/profile';
import Search from 'assets/search';
import React from 'react';

const navBar = () => {
  return (
    <nav className='navBar'>

      <div className="loginBackground">&nbsp;</div>

      <form className="searchBar navBar__gridPos-1">
        <input type='text' className='searchBar__input' placeholder='Search'></input>
        <Search className={'searchBar__icon'} />
      </form>

      <div className="navBar__gridPos-2">
        <span className='navBar__item navBar__gridPos-2'>
          <Cart className={'navBar__icon'}/>
        </span>
        <span className='navBar__item navBar__gridPos-2'>
          <Profile className={'navBar__icon'}/>
        </span>
      </div>
        
  
      <div className="navBar__gridPos-3">
        <Logo className={'logo'}/>
      </div>
    </nav>
  );
};

export default navBar;
