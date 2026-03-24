import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, deleteJob } from '../slices/jobsSlice';
import { applyToJob } from '../slices/applicationsSlice';
import { Link } from 'react-router-dom';

export default function JobList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.jobs);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const onApply = (id) => dispatch(applyToJob(id));
  const onDelete = (id) => dispatch(deleteJob(id));

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Job Listings</h2>
      {list.length === 0 && <p>No jobs available.</p>}
      {list.map((job) => (
        <div key={job.id} style={{ border: '1px solid #ccc', padding: '0.8rem', marginBottom: '0.6rem' }}>
          <h4>{job.title}</h4>
          <p>{job.description}</p>
          <p><strong>Company/owner:</strong> {job.company}</p>
          {user?.role === 'applicant' && <button onClick={() => onApply(job.id)}>Apply</button>}
          {user?.role === 'employer' && user.email === job.company && (
            <>
              <Link to={`/jobs/${job.id}/edit`} style={{ marginRight: '0.5rem' }}>Edit</Link>
              <button onClick={() => onDelete(job.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
