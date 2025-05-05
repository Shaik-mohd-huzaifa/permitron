import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }
    
    // Attempt login
    setTimeout(() => {
      const result = login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
      
      setIsLoading(false);
    }, 800); // Simulate network request
  };

  const fillCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-100 rounded-xl overflow-hidden">
      <CardHeader className="bg-primary-500/5 border-b border-gray-100 pb-6">
        <CardTitle className="text-center text-2xl text-gray-800 font-semibold">Login to Your Account</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 p-3 rounded-lg flex items-start">
              <AlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={18} />}
            required
            className="h-12 rounded-lg"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            required
            className="h-12 rounded-lg"
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-lg font-medium text-base shadow-sm"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-3 text-center">Demo Accounts</h3>
            <div className="space-y-3">
              <div 
                className="bg-gray-50 p-3 rounded-lg flex items-center text-sm cursor-pointer hover:bg-primary-50 hover:border hover:border-primary-100 transition-all"
                onClick={() => fillCredentials('admin@example.com', 'admin123')}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <User size={16} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Admin Account</div>
                  <div className="text-gray-500 text-xs">admin@example.com / admin123</div>
                </div>
              </div>
              
              <div 
                className="bg-gray-50 p-3 rounded-lg flex items-center text-sm cursor-pointer hover:bg-primary-50 hover:border hover:border-primary-100 transition-all"
                onClick={() => fillCredentials('employee@example.com', 'employee123')}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <User size={16} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Employee Account</div>
                  <div className="text-gray-500 text-xs">employee@example.com / employee123</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};