import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createJob, updateJob, fetchJobs } from '../slices/jobsSlice';
import { useNavigate, useParams } from 'react-router-dom';

export default function JobForm({ edit }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { list } = useSelector((state) => state.jobs);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (edit && id && list.length > 0) {
      const job = list.find((j) => String(j.id) === String(id));
      if (job) {
        setTitle(job.title);
        setDescription(job.description);
      }
    }
  }, [edit, id, list]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (edit && id) {
      await dispatch(updateJob({ id, title, description }));
    } else {
      await dispatch(createJob({ title, description }));
    }
    navigate('/');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{edit ? 'Edit' : 'Create'} Job</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <button type="submit">{edit ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
}
