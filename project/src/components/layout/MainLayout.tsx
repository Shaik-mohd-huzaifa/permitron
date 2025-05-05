import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';

export const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { 
      path: '/', 
      label: 'Board', 
      icon: <LayoutDashboard size={20} />,
      isActive: isActive('/'),
    },
    { 
      path: '/chat', 
      label: 'Chat Assistant', 
      icon: <MessageSquare size={20} />,
      isActive: isActive('/chat'),
    },
  ];
  
  // If the user isn't authenticated, redirect to login
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center">
            <button 
              className="inline-flex md:hidden mr-3"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="text-indigo-600 font-bold text-xl">TaskFlow</div>
          </div>
          
          {/* Profile dropdown */}
          <div className="flex items-center gap-4">
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-2 transition-colors">
                  <Avatar src={user.avatar} alt={user.name} size="sm" />
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                  <ChevronDown size={16} />
                </button>
              }
              align="right"
              width={200}
              items={[
                {
                  id: 'role',
                  label: `Role: ${user.role}`,
                  disabled: true,
                },
                {
                  id: 'profile',
                  label: 'Profile Settings',
                  icon: <UserCog size={16} />,
                  onClick: () => {},
                },
                {
                  id: 'logout',
                  label: 'Logout',
                  icon: <LogOut size={16} />,
                  onClick: handleLogout,
                },
              ]}
            />
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation */}
        <aside 
          className={`
            ${isMobileMenuOpen ? 'block' : 'hidden'} 
            md:block w-64 bg-white border-r border-gray-200 z-20
            fixed md:static inset-y-0 left-0 transform 
            md:translate-x-0 transition duration-200 ease-in-out
            pt-16 md:pt-0
          `}
        >
          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-md 
                  ${item.isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};