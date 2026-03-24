import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import Login from './pages/Login';
import Signup from './pages/Signup';
import JobList from './pages/JobList';
import JobForm from './pages/JobForm';
import Applications from './pages/Applications';
import Header from './components/Header';

const PrivateRoute = ({ children, role }) => {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<PrivateRoute><JobList /></PrivateRoute>} />
        <Route path="/jobs/new" element={<PrivateRoute role="employer"><JobForm /></PrivateRoute>} />
        <Route path="/jobs/:id/edit" element={<PrivateRoute role="employer"><JobForm edit /></PrivateRoute>} />
        <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
