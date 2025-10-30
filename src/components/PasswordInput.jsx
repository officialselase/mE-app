import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const PasswordInput = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "••••••••",
  disabled = false,
  error = '',
  showStrengthIndicator = false,
  className = '',
  label = 'Password',
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) {return { score: 0, label: '', color: '' };}

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate score
    Object.values(checks).forEach(check => {
      if (check) {score++;}
    });

    // Determine strength level
    let label, color;
    if (score <= 1) {
      label = 'Very Weak';
      color = 'bg-red-500';
    } else if (score === 2) {
      label = 'Weak';
      color = 'bg-orange-500';
    } else if (score === 3) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (score === 4) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score, label, color, checks };
  };

  const strength = showStrengthIndicator ? calculatePasswordStrength(value) : null;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        
        {/* Password visibility toggle */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={disabled ? -1 : 0}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p 
          id={`${id}-error`} 
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Password strength indicator */}
      {showStrengthIndicator && value && (
        <div className="space-y-2">
          {/* Strength bar */}
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  level <= strength.score ? strength.color : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          {/* Strength label */}
          <p className="text-sm text-gray-600">
            Password strength: <span className="font-medium">{strength.label}</span>
          </p>

          {/* Password requirements */}
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className={`flex items-center space-x-2 ${strength.checks.length ? 'text-green-600' : 'text-gray-500'}`}>
              {strength.checks.length ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center space-x-2 ${strength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
              {strength.checks.lowercase ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>Lowercase letter</span>
            </div>
            <div className={`flex items-center space-x-2 ${strength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              {strength.checks.uppercase ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>Uppercase letter</span>
            </div>
            <div className={`flex items-center space-x-2 ${strength.checks.numbers ? 'text-green-600' : 'text-gray-500'}`}>
              {strength.checks.numbers ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>Number</span>
            </div>
            <div className={`flex items-center space-x-2 ${strength.checks.symbols ? 'text-green-600' : 'text-gray-500'}`}>
              {strength.checks.symbols ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>Special character</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;