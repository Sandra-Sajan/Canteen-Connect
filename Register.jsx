import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        id: '',
        pass: '',
        confirmPass: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.id || !formData.pass || !formData.confirmPass) {
            setError('All fields are required');
            return;
        }

        if (formData.pass !== formData.confirmPass) {
            setError('Passwords do not match');
            return;
        }

        const res = await register({
            name: formData.name,
            id: formData.id,
            pass: formData.pass
        });

        if (res.success) {
            navigate('/user');
        } else {
            setError(res.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-dark)',
            padding: '1rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        color: 'var(--primary)'
                    }}>
                        <UserPlus size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join St. Thomas College Canteen</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            style={{ width: '100%', backgroundColor: 'var(--bg-dark)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Register Number / Staff ID</label>
                        <input
                            type="text"
                            name="id"
                            className="input"
                            value={formData.id}
                            onChange={handleChange}
                            placeholder="e.g. STC23CS040"
                            style={{ width: '100%', backgroundColor: 'var(--bg-dark)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            name="pass"
                            className="input"
                            value={formData.pass}
                            onChange={handleChange}
                            placeholder="••••••••"
                            style={{ width: '100%', backgroundColor: 'var(--bg-dark)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPass"
                            className="input"
                            value={formData.confirmPass}
                            onChange={handleChange}
                            placeholder="••••••••"
                            style={{ width: '100%', backgroundColor: 'var(--bg-dark)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', padding: '0.8rem' }}
                    >
                        Sign Up
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                        Login
                    </Link>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem'
            }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2rem',
                    fontSize: '0.9rem'
                }}>
                    <ArrowLeft size={16} /> Home
                </Link>
            </div>
        </div>
    );
};

export default Register;
