import NavBar from "../components/NavBar";
import BgDarkVeil from "../assets/backgrounds/DarkVeil";

const Home = () => {
  return (
    <div className="main">
      <NavBar />
      <div className="home-content">
        <div className="home-welcomeMessage">
          <BgDarkVeil className="welcomeBg" />
          <h1>Welcome to the E-Commerce Platform</h1>
          <p>Your one-stop shop for all your needs!</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
