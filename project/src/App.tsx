import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { BoardPage } from './pages/BoardPage';
import { ChatPage } from './pages/ChatPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<BoardPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
        
        {/* Redirect to login if not authenticated, otherwise to board */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

export default App;