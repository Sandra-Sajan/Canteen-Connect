import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, Sparkles, User, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    // Debug Log
    console.log("Landing Page Mounted");

    const GALLERY = [
        { src: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80", label: "Masala Chai" },
        { src: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&q=80", label: "Filter Coffee" },
        { src: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", label: "Cool Drinks" },
        { src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80", label: "Indian Snacks" },
        { src: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80", label: "South Indian" },
    ];

    return (
        <div className="landing-page" style={{
            minHeight: '100vh',
            display: 'flex',
            backgroundColor: 'var(--bg-dark)',
            overflow: 'hidden'
        }}>

            {/* Left Side - 3D Wall Projection */}
            <div style={{
                flex: '1.2',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '1200px', // Deeper perspective
                background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                overflow: 'hidden'
            }}>
                {/* 3D Grid Container */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', // 3 Columns for denser look
                    gap: '1.5rem',
                    transform: 'rotateY(15deg) rotateX(10deg) translateZ(-100px) scale(1.3)', // Wall effect
                    transformStyle: 'preserve-3d',
                    width: '120%',
                    height: '120%',
                    opacity: 0.85
                }}>
                    {/* Repeat Gallery to fill the grid */}
                    {[...GALLERY, ...GALLERY, ...GALLERY].map((item, i) => (
                        <div key={i} style={{
                            position: 'relative',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            height: '180px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'transform 0.4s ease',
                            animation: `float ${6 + (i % 3)}s ease-in-out infinite alternate` // Subtle movement
                        }}>
                            <img
                                src={item.src}
                                alt={item.label}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: 'contrast(1.2) saturate(1.1) brightness(0.9)',
                                    transform: 'scale(1.05)' // Avoid edge bleeding
                                }}
                            />
                            {/* Gradient Overlay for Text */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                padding: '0.8rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Vignette Overlay for focus */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle, transparent 40%, #0f172a 100%)',
                    pointerEvents: 'none',
                    zIndex: 2
                }}></div>
            </div>

            {/* Right Side - Vertical Actions */}
            <div style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',

                zIndex: 100, // Ensure it's above any 3D projections
                position: 'relative',
                background: 'rgba(15, 23, 42, 0.95)', // Slightly distinct background
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' // distinct separation
            }}>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        position: 'relative',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        color: 'var(--primary)',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        padding: '1.5rem',
                        borderRadius: '50%',
                        boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
                        border: '2px solid rgba(99, 102, 241, 0.1)'
                    }}>
                        <ChefHat size={64} strokeWidth={1.5} />
                        <Sparkles
                            size={28}
                            color="#fbbf24"
                            style={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                filter: 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))',
                                animation: 'pulse 2s infinite'
                            }}
                        />
                    </div>
                    <h1 className="font-decorative" style={{
                        fontSize: '3.5rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(to right, var(--primary), #e11d48)',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                    }}>
                        Canteen Connect
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        Choose your role to continue
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    width: '100%',
                    maxWidth: '400px'
                }}>

                    {/* User Card */}
                    <Link to="/login?role=user" className="card" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '1.5rem',
                        transition: 'all 0.3s',
                        transform: 'scale(1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                        }}
                    >
                        <div style={{
                            backgroundColor: 'var(--primary)',
                            padding: '1rem',
                            borderRadius: '0.8rem',
                            color: 'white'
                        }}>
                            <User size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>User Login</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order food & drinks</p>
                        </div>
                        <ArrowRight color="var(--primary)" />
                    </Link>

                    {/* Admin Card */}
                    <Link to="/login?role=admin" className="card" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '1.5rem',
                        transition: 'all 0.3s',
                        transform: 'scale(1)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.borderColor = 'var(--success)';
                            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                        }}
                    >
                        <div style={{
                            backgroundColor: 'var(--success)',
                            padding: '1rem',
                            borderRadius: '0.8rem',
                            color: 'white'
                        }}>
                            <ShieldCheck size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>Admin Login</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage the canteen</p>
                        </div>
                        <ArrowRight color="var(--success)" />
                    </Link>

                    {/* New Registration Card */}
                    <Link to="/register" className="card" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        padding: '1.5rem',
                        transition: 'all 0.3s',
                        transform: 'scale(1)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.borderColor = '#f43f5e';
                            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                        }}
                    >
                        <div style={{
                            backgroundColor: '#f43f5e',
                            padding: '1rem',
                            borderRadius: '0.8rem',
                            color: 'white'
                        }}>
                            <UserPlus size={32} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>New User?</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create an account</p>
                        </div>
                        <ArrowRight color="#f43f5e" />
                    </Link>

                </div>
            </div>

        </div >
    );
};

export default Landing;
