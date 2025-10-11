import { useState } from 'react';
import PasswordInput from './PasswordInput';

const PasswordDemo = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Password Input Demo</h1>
        <p className="text-gray-600">Try out the new password features</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Registration Form Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">Registration Form</h2>
          <div className="space-y-4">
            <PasswordInput
              id="demo-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              showStrengthIndicator={true}
              placeholder="Enter your password"
              className="focus:ring-purple-500"
            />
            
            <PasswordInput
              id="demo-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              label="Confirm Password"
              placeholder="Confirm your password"
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
              className="focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Login Form Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Login Form</h2>
          <div className="space-y-4">
            <PasswordInput
              id="demo-login-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              label="Password"
              placeholder="Enter your password"
              className="focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Enhanced Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🔒 Security Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Password visibility toggle</li>
              <li>• Real-time strength indicator</li>
              <li>• Password requirements checklist</li>
              <li>• Confirm password validation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">♿ Accessibility Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Screen reader support</li>
              <li>• Keyboard navigation</li>
              <li>• ARIA labels and descriptions</li>
              <li>• Error announcements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Password Tips */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">💡 Password Tips</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Strong passwords should have:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>At least 8 characters (longer is better)</li>
            <li>Mix of uppercase and lowercase letters</li>
            <li>Numbers and special characters</li>
            <li>Avoid common words or personal information</li>
            <li>Use unique passwords for different accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordDemo;