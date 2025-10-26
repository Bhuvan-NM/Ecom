import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext"; // Import AuthContext
import XMark from "../assets/icons/XMark";
import Logo from "../assets/icons/logo";

interface LoginRegisterProps {
  setIsLoginVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

const LoginRegister = ({ setIsLoginVisible }: LoginRegisterProps) => {
  const { login } = useContext(AuthContext)!; // Access global login function
  const [isRegister, setIsRegister] = useState(false);
  const [isUIReady, setIsUIReady] = useState(false); // Delay UI updates

  // Initialize form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    // ✅ Delay UI changes after login to prevent DOM errors
    setTimeout(() => {
      setIsUIReady(true);
    }, 100); // Small delay to ensure React updates the DOM
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleClose = () => {
    setTimeout(() => {
      setIsLoginVisible(false);
    }, 50);
  };

  const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  // ✅ Handle Registration and Login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isRegister) {
        // REGISTER API CALL
        const response = await axios.post("/auth/register", formData, {
          withCredentials: true, // Enable cookies/auth token sharing
        });

        alert("Registration successful! Please login.");
      } else {
        // 🚀 LOGIN API CALL
        const response = await axios.post(
          "/auth/login",
          {
            email: formData.email,
            password: formData.password,
          },
          {
            withCredentials: true,
          }
        );

        // Extract user data
        const { token, user } = response.data;

        // ✅ Update Auth Context (global state)
        login(user, token);

        // ✅ Delay updating UI after login
        setTimeout(() => {
          login(user, token);
          setIsLoginVisible(false);
        }, 100); // Small delay to prevent insertion errors

        setIsLoginVisible(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="auth__container">
      <form
        onSubmit={handleSubmit}
        className="form"
      >
        <div
          className="auth__form"
          onClick={stopPropagation}
        >
          <div className="auth__form__container">
            <span
              className="auth__close"
              onClick={handleClose}
            >
              <XMark className="auth__close__btn" />
            </span>

            <span className="auth__logo">
              <Logo className="auth__logo" />
            </span>

            <h2 className="auth__title">
              {isRegister ? "Create Account" : "Login"}
            </h2>

            <div className="auth__inputGroup">
              {isRegister && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="auth__inputGroup__field"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="firstName"
                    className="auth__inputGroup__label"
                  >
                    First Name
                  </label>

                  <input
                    type="text"
                    placeholder="Last Name"
                    className="auth__inputGroup__field"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="lastName"
                    className="auth__inputGroup__label"
                  >
                    Last Name
                  </label>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="auth__inputGroup__field"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                  />
                  <label
                    htmlFor="phoneNumber"
                    className="auth__inputGroup__label"
                  >
                    Phone Number
                  </label>
                </>
              )}

              <input
                type="email"
                placeholder="Email Address"
                className="auth__inputGroup__field"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label
                htmlFor="email"
                className="auth__inputGroup__label"
              >
                Email Address
              </label>

              <input
                type="password"
                placeholder="Password"
                className="auth__inputGroup__field"
                id="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
              <label
                htmlFor="password"
                className="auth__inputGroup__label"
              >
                Password
              </label>
            </div>

            <button
              type="submit"
              className="auth__btn"
            >
              {isRegister ? "Sign Up" : "Login"}
            </button>

            <p
              className="auth__toggle"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <span>{isRegister ? "Login" : "Create Account"}</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;
