import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | FlacronAI';
  }, []);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .not-found-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Poppins', sans-serif;
        }

        .not-found-content {
          text-align: center;
          max-width: 600px;
        }

        .error-code {
          font-size: 10rem;
          font-weight: 900;
          background: linear-gradient(135deg, #FF7C08 0%, #ff9f40 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 1rem;
          text-shadow: 0 0 60px rgba(255, 124, 8, 0.3);
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .error-message {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: #FF7C08;
          color: #000000;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 50px;
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(255, 124, 8, 0.3);
        }

        .btn-primary:hover {
          background: #ff9f40;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(255, 124, 8, 0.5);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 50px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .floating-icon {
          position: absolute;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .icon-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .icon-2 {
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        .icon-3 {
          bottom: 15%;
          left: 15%;
          animation-delay: 4s;
        }

        .icon-4 {
          bottom: 20%;
          right: 10%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 768px) {
          .error-code {
            font-size: 6rem;
          }

          .error-title {
            font-size: 1.8rem;
          }

          .error-message {
            font-size: 1rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .floating-icon {
            display: none;
          }
        }
      `}</style>

      <div className="not-found-container">
        {/* Floating Background Icons */}
        <svg className="floating-icon icon-1" width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <svg className="floating-icon icon-2" width="60" height="60" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#FF7C08" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="#FF7C08" strokeWidth="2" strokeLinecap="round"/>
        </svg>

        <svg className="floating-icon icon-3" width="70" height="70" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="#FF7C08" strokeWidth="2"/>
          <path d="M3 10H21" stroke="#FF7C08" strokeWidth="2"/>
        </svg>

        <svg className="floating-icon icon-4" width="65" height="65" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#FF7C08" strokeWidth="2"/>
          <circle cx="12" cy="7" r="4" stroke="#FF7C08" strokeWidth="2"/>
        </svg>

        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            Let's get you back on track.
          </p>
          <div className="action-buttons">
            <Link to="/" className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Go Home
            </Link>
            <Link to="/auth" className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
