import { LoginForm } from '../components/auth/LoginForm';
import { Shield } from 'lucide-react';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col py-[10vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
            <Shield className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2 tracking-tight">Permitron</h1>
        <p className="text-center text-gray-500 mb-6">Role-Based Access Management</p>
        <LoginForm />
      </div>
    </div>
  );
};