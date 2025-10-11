import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBear from '../components/AnimatedBear';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState('idle');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    setAuthState('idle');

    // Validate fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      setAuthState('error');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      setAuthState('success');
      
      // Navigate after short delay to show success state
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setAuthState('error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          {/* Animated Bear */}
          <AnimatedBear
            isPasswordFocused={isPasswordFocused}
            isEmailFocused={isEmailFocused}
            authState={authState}
          />

          {/* Error Message */}
          {error && (
            <div 
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-4">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setError('');
                }}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => {
                  setIsEmailFocused(false);
                  const err = validateEmail(email);
                  setEmailError(err);
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                disabled={isLoading}
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p 
                  id="email-error" 
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                  setError('');
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => {
                  setIsPasswordFocused(false);
                  const err = validatePassword(password);
                  setPasswordError(err);
                }}
                error={passwordError}
                disabled={isLoading}
                label="Password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
