import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <h1>FLACRON<span>AI</span></h1>
          </Link>
          <nav className="nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link to="/auth" className="btn btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
