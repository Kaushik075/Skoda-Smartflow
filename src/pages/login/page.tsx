
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/base/Button';
import { Input } from '../../components/base/Input';
import { Select } from '../../components/base/Select';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password, role);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use password: password123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#006E5B] to-[#005A4A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <img 
            src="https://www.skoda-storyboard.com/direct-download/2023/12/Skoda_Corporate_Logo_RGB_Emerald_on_Electric_Green_efdf74e3-1920x1449.png"
            alt="Skoda Logo"
            className="h-12 md:h-16 w-auto mx-auto mb-3 md:mb-4"
          />
          <h1 className="text-xl md:text-2xl font-bold text-[#006E5B] mb-2">Mahavir Skoda</h1>
          <p className="text-sm md:text-base text-gray-600">Sales Automation System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            >
              <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-lg`}></i>
            </button>
          </div>

          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select your role</option>
            <option value="Marketing Team">Marketing Team</option>
            <option value="CRT">CRT (Customer Relations Team)</option>
            <option value="Sales Executive">Sales Executive</option>
            <option value="IT Admin">IT Admin</option>
          </Select>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 md:py-4 text-base md:text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
          <div className="text-xs space-y-1">
            <p><strong>Username:</strong> marketing1, crt1, sales1, admin1</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}