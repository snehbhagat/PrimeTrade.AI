import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch {
      setError('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, form);
        setSuccess('Task updated!');
      } else {
        await api.post('/tasks', form);
        setSuccess('Task created!');
      }
      setForm({ title: '', description: '' });
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description || '' });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setSuccess('Task deleted!');
      fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={{ margin: 0 }}>📋 Task Manager</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>👤 {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Form */}
        <div style={styles.card}>
          <h3>{editingId ? 'Edit Task' : 'New Task'}</h3>
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={styles.button} type="submit">
                {editingId ? 'Update Task' : 'Create Task'}
              </button>
              {editingId && (
                <button
                  style={{ ...styles.button, background: '#6b7280' }}
                  type="button"
                  onClick={() => { setEditingId(null); setForm({ title: '', description: '' }); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Task List */}
        <div style={styles.card}>
          <h3>Your Tasks ({tasks.length})</h3>
          {tasks.length === 0 && <p style={{ color: '#6b7280' }}>No tasks yet. Create one above!</p>}
          {tasks.map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div>
                <strong>{task.title}</strong>
                {task.description && <p style={{ margin: '4px 0 0', color: '#6b7280' }}>{task.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={styles.editBtn} onClick={() => handleEdit(task)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: { background: '#4f46e5', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  content: { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  logoutBtn: { padding: '6px 14px', background: '#fff', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '10px' },
  editBtn: { padding: '6px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '10px' },
  success: { color: 'green', marginBottom: '10px' }
};