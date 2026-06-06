import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isSignup) {
        // Signup flow - create account but don't auto-login
        const result = await signup(email, password, confirmPassword);
        
        if (result.success) {
          // Show success message and switch to sign in
          setSuccessMessage('✅ Account created successfully! Please sign in with your credentials.');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          
          // Auto-switch to sign in mode after 2 seconds
          setTimeout(() => {
            setIsSignup(false);
            setSuccessMessage('');
          }, 1000);
        } else {
          setError(result.error || 'Signup failed');
        }
      } else {
        // Login flow - proceed to research page
        const result = await login(email, password);
        
        if (result.success) {
          navigate('/research');
        } else {
          setError(result.error || 'An error occurred');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>CuraLink</h1>
          <p className="subtitle">Medical Research Engine</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              disabled={isLoading}
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="toggle-mode">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-button"
              disabled={isLoading}
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="info-section">
          <p className="info-text">
            🔒 Your medical research is secure and private
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
