import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '../slices/applicationsSlice';

export default function Applications() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.applications);

  useEffect(() => { dispatch(fetchApplications()); }, [dispatch]);

  if (loading) return <p>Loading applications...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Applications</h2>
      {list.length === 0 ? <p>No applications yet.</p> : (
        <ul>
          {list.map((app) => (
            <li key={app.id}>Job {app.job_id} by {app.applicant}: {app.status}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
