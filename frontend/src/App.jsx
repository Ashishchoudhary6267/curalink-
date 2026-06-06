import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Research from './pages/Research';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { loadUserFromStorage } = useAuth();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/research"
        element={
          <ProtectedRoute>
            <Research />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/research" replace />} />
      <Route path="*" element={<Navigate to="/research" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;