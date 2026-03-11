import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token && userId) {
      // Store user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      if (userName) {
        localStorage.setItem('userName', decodeURIComponent(userName));
      }

      // Navigate to home page
      navigate('/home');
    } else {
      // Missing token or userId, redirect back to login
      navigate('/login?error=missing_oauth_data');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1625'
    }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{
          border: '4px solid #7b5cf1',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ fontSize: '18px', color: '#cfc9e8' }}>Completing sign in...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
