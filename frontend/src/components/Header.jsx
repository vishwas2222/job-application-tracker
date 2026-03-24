import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', gap: '1rem' }}>
      <Link to="/">Jobs</Link>
      <Link to="/applications">Applications</Link>
      {user?.role === 'employer' && <Link to="/jobs/new">New Job</Link>}
      {user ? (
        <button onClick={() => dispatch(logout())}>Logout</button>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </header>
  );
}
