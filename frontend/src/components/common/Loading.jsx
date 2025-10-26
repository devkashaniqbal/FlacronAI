import './Loading.css';

const Loading = ({ size = 'medium', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner loading-${size}`}>
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner loading-${size}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;
