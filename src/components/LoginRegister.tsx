import React, { useState } from "react";
import { motion } from "framer-motion"; // SCSS file for styling
import XMark from "assets/icons/XMark";
import Logo from "assets/icons/logo";

// ✅ Prevent click propagation inside the modal
interface LoginRegisterProps {
    setIsLoginVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginRegister = ({setIsLoginVisible}:LoginRegisterProps) => {
  const [isRegister, setIsRegister] = useState(false);

  const handleClose = () => {
    setTimeout(() => {
        setIsLoginVisible(false);
        }, 50);
    };

    const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
      };

  return (
    <div className="auth__container">
      <motion.div
        className="auth__form"
        onClick={stopPropagation}
      >
        <div className="auth__form__container">

            <span className="auth__close"  onClick={handleClose}>
                <XMark className="auth__close__btn" />
            </span>
           
           <span className="auth__logo">
                <Logo className="auth__logo"/>
           </span>

            <h2 className="auth__title">{isRegister ? "Create Account" : "Login"}</h2>

            <div className="auth__inputGroup">
                <input type="email" placeholder="Email Address" className="auth__inputGroup__field" id="email" />
                <label htmlFor="email">Email Address</label>
                <input type="password" placeholder="Password" className="auth__inputGroup__field" id="password" />
                <label htmlFor="password">Password</label>
                {isRegister && <input type="email" placeholder="Email" className="auth__inputGroup__field" />} {/* Extra field for Register */}
            </div>

            

            <button className="auth__btn">{isRegister ? "Sign Up" : "Login"}</button>
            <p className="auth__toggle">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? "Login" : "Create Account"}
            </span>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRegister;