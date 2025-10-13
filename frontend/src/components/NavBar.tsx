import Cart from "../assets/icons/cart";
import Logo from "../assets/icons/logo";
import Profile from "../assets/icons/profile";
import Search from "../assets/icons/search";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import { AuthContext } from "./AuthContext";
import { StaggeredMenu, StaggeredMenuItem } from "./StaggeredMenu";

const NavBar = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const profileRef = useRef<HTMLSpanElement | null>(null);
  const [profilePosition, setProfilePosition] = useState({ x: 0, y: 0 });
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const menuItems = useMemo(() => {
    const items: StaggeredMenuItem[] = [
      {
        label: "Home",
        ariaLabel: "Go to the home page",
        navigate: "/",
      },
      {
        label: user ? "Account" : "Sign in",
        ariaLabel: "Open your account page",
        navigate: "/account",
      },
    ];

    if (user?.isAdmin) {
      items.push({
        label: "Admin",
        ariaLabel: "Open the admin dashboard",
        navigate: "/admin",
      });
    }

    return items;
  }, [user]);

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

  const hanpleProfileClick = () => {
    if (user) {
      navigate("/account");
    } else {
      setIsLoginVisible(true);
    }
  };

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
        {user?.isAdmin && (
          <span
            className="navBar__item navBar__gridPos-2 cursor-pointer"
            onClick={() => navigate("/admin")}
          >
            Admin
          </span>
        )}
        <span
          ref={profileRef}
          className="navBar__item navBar__gridPos-2 cursor-pointer"
          onClick={() => hanpleProfileClick()}
        >
          <Profile className="navBar__icon login" />
        </span>
        <StaggeredMenu
          className="navBar__menuToggle"
          menuButtonColor="#003459"
          openMenuButtonColor="#003459"
          changeMenuColorOnOpen={false}
          accentColor="#00a7e1"
          colors={["#00a7e1", "#003459", "#00171f"]}
          items={menuItems}
          displaySocials={false}
          displayItemNumbering={false}
        />
      </div>

      {/* Logo */}
      <div
        className="navBar__gridPos-3"
        onClick={() => navigate("/")}
      >
        <Logo className="logo" />
      </div>
    </nav>
  );
};

export default NavBar;
