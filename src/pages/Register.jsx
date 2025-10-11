import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBear from '../components/AnimatedBear';
import PasswordInput from '../components/PasswordInput';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState('idle');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    
    // Enhanced password requirements
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasLowercase || !hasUppercase || !hasNumbers) {
      return 'Password must contain uppercase, lowercase, and numbers';
    }
    
    return '';
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Display name validation
  const validateDisplayName = (name) => {
    if (!name) {
      return 'Display name is required';
    }
    if (name.length < 2) {
      return 'Display name must be at least 2 characters';
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
    setConfirmPasswordError('');
    setDisplayNameError('');
    setAuthState('idle');

    // Validate fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);
    const nameErr = validateDisplayName(displayName);

    if (emailErr || passwordErr || confirmPasswordErr || nameErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      setConfirmPasswordError(confirmPasswordErr);
      setDisplayNameError(nameErr);
      setAuthState('error');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, displayName);
      setAuthState('success');
      
      // Navigate after short delay to show success state
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setAuthState('error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us to get started</p>
          </div>

          {/* Animated Bear */}
          <AnimatedBear
            isPasswordFocused={isPasswordFocused || isConfirmPasswordFocused}
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

          {/* Register Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Display Name Field */}
            <div className="mb-4">
              <label 
                htmlFor="displayName" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setDisplayNameError('');
                  setError('');
                }}
                onBlur={() => {
                  const err = validateDisplayName(displayName);
                  setDisplayNameError(err);
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  displayNameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
                disabled={isLoading}
                aria-invalid={displayNameError ? 'true' : 'false'}
                aria-describedby={displayNameError ? 'displayName-error' : undefined}
              />
              {displayNameError && (
                <p 
                  id="displayName-error" 
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {displayNameError}
                </p>
              )}
            </div>

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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
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
            <div className="mb-4">
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                  setConfirmPasswordError('');
                  setError('');
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => {
                  setIsPasswordFocused(false);
                  const err = validatePassword(password);
                  setPasswordError(err);
                  // Also validate confirm password if it has a value
                  if (confirmPassword) {
                    const confirmErr = validateConfirmPassword(confirmPassword, password);
                    setConfirmPasswordError(confirmErr);
                  }
                }}
                error={passwordError}
                disabled={isLoading}
                label="Password"
                showStrengthIndicator={true}
                className="focus:ring-purple-500"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError('');
                  setError('');
                }}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => {
                  setIsConfirmPasswordFocused(false);
                  const err = validateConfirmPassword(confirmPassword, password);
                  setConfirmPasswordError(err);
                }}
                error={confirmPasswordError}
                disabled={isLoading}
                label="Confirm Password"
                placeholder="••••••••"
                className="focus:ring-purple-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-medium focus:outline-none focus:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
