import React, { useState } from "react";
import axios from "axios";
import XMark from "assets/icons/XMark";
import Logo from "assets/icons/logo";

interface LoginRegisterProps {
  setIsLoginVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define the structure of the form data
interface FormData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email: string;
  password: string;
}

const LoginRegister = ({ setIsLoginVisible }: LoginRegisterProps) => {
  const [isRegister, setIsRegister] = useState(false);

  // Initialize form state with TypeScript type checking
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  // Handle form field changes with type safety
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleClose = () => {
    setTimeout(() => {
      setIsLoginVisible(false);
    }, 50);
  };

  const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      if (isRegister) {
        // REGISTER API CALL
        const response = await axios.post("http://localhost:1337/auth/register", formData, {
          withCredentials: true, // ✅ IMPORTANT: Allows CORS to handle cookies/tokens
        });
        alert(response.data.message);
      } else {
        // LOGIN API CALL
        const response = await axios.post("http://localhost:1337/auth/login", {
          email: formData.email,
          password: formData.password,
        }, {
          withCredentials: true, // ✅ IMPORTANT
        });
  
        // Store authentication token
        localStorage.setItem("authToken", response.data.token);
        alert("Login successful!");
      }
  
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="auth__container">
      <form onSubmit={handleSubmit} className="form">
        <div className="auth__form" onClick={stopPropagation}>
          <div className="auth__form__container">
            <span className="auth__close" onClick={handleClose}>
              <XMark className="auth__close__btn" />
            </span>

            <span className="auth__logo">
              <Logo className="auth__logo" />
            </span>

            <h2 className="auth__title">{isRegister ? "Create Account" : "Login"}</h2>

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
                  <label htmlFor="firstName" className="auth__inputGroup__label">First Name</label>

                  <input
                    type="text"
                    placeholder="Last Name"
                    className="auth__inputGroup__field"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="lastName" className="auth__inputGroup__label">Last Name</label>

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
                  <label htmlFor="phoneNumber" className="auth__inputGroup__label">Phone Number</label>
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
              <label htmlFor="email" className="auth__inputGroup__label">Email Address</label>

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
              <label htmlFor="password" className="auth__inputGroup__label">Password</label>
            </div>

            <button type="submit" className="auth__btn">
              {isRegister ? "Sign Up" : "Login"}
            </button>

            <p className="auth__toggle" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <span>{isRegister ? "Login" : "Create Account"}</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginRegister;