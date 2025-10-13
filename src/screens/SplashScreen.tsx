// app/screens/SplashScreen.tsx - Web Compatible Version
import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC = () => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Simple fade-in effect
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#4CAF50',
    opacity: opacity,
    transition: 'opacity 1s ease-in-out',
    paddingTop: '60px',
    paddingBottom: '60px',
    boxSizing: 'border-box' as const,
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  };

  const logoContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '60px',
  };

  const logoStyle = {
    fontSize: '100px',
    marginBottom: '20px',
  };

  const appNameStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: '2px',
  };

  const loadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  };

  const loadingTextStyle = {
    marginTop: '16px',
    fontSize: '16px',
    color: '#fff',
    opacity: 0.9,
  };

  const footerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  };

  const taglineStyle = {
    fontSize: '16px',
    color: '#fff',
    textAlign: 'center' as const,
    opacity: 0.9,
    marginBottom: '8px',
  };

  const versionStyle = {
    fontSize: '14px',
    color: '#fff',
    opacity: 0.7,
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={logoContainerStyle}>
          <div style={logoStyle}>🥬</div>
          <div style={appNameStyle}>FreshCart</div>
        </div>

        <div style={loadingContainerStyle}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={loadingTextStyle}>Loading...</div>
        </div>
      </div>

      <div style={footerStyle}>
        <div style={taglineStyle}>Fresh groceries at your doorstep</div>
        <div style={versionStyle}>Version 1.0.0</div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;