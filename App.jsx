import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // Fallback to localStorage check to avoid race conditions during login/navigation
  const storedUser = JSON.parse(localStorage.getItem('canteen_user') || 'null');
  const activeUser = user || storedUser;

  if (!activeUser) return <Navigate to="/login" />;
  if (role && activeUser.role !== role) return <Navigate to="/" />;
  return children;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'white', backgroundColor: '#111', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1>🛑 Something went wrong.</h1>
          <h3 style={{ color: '#ff5555' }}>{this.state.error && this.state.error.toString()}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#aaa' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.href = '/'} style={{ padding: '1rem', marginTop: '1rem', cursor: 'pointer' }}>
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/user/*" element={
        <ProtectedRoute role="user">
          <UserDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="app-container">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
