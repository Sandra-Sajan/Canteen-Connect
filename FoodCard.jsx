import { Plus, Flame, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FoodCard = ({ item, onAdd }) => {
    const { user } = useAuth();

    // Check allergies
    const userAllergies = user?.preferences?.allergies || [];
    const itemAllergens = item.allergens || [];
    const hasAllergyConflict = itemAllergens.some(allergen => userAllergies.includes(allergen));

    return (
        <div className="card" style={{
            padding: '0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--bg-card)',
            border: hasAllergyConflict ? '2px solid var(--danger)' : '1px solid var(--border)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'relative'
        }}>
            <div style={{ height: '130px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    pointerEvents: 'none'
                }}></div>

                {/* Dietary Badge */}
                <span style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    backgroundColor: item.dietary === 'Veg' ? 'var(--success)' : 'var(--danger)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></span>
                    {item.dietary?.toUpperCase() || 'N/A'}
                </span>

                {/* Nutrition Badge */}
                {item.calories && (
                    <div style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        color: 'white',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                            <Flame size={12} fill="orange" stroke="orange" /> {item.calories} kcal
                        </span>
                        <span>|</span>
                        <span>{item.protein || '0g'} Protein</span>
                    </div>
                )}
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: '1.3' }}>{item.name}</h3>
                    <span style={{
                        color: 'var(--primary)',
                        fontWeight: '600',
                    }}>
                        ₹{item.price}
                    </span>
                </div>

                {/* Allergy Alert */}
                {hasAllergyConflict && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: 'var(--danger)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertTriangle size={16} />
                        <span>Contains {itemAllergens.filter(a => userAllergies.includes(a)).join(', ')}!</span>
                    </div>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1, lineHeight: '1.4' }}>
                    {item.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {item.tags?.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-dark)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            #{tag}
                        </span>
                    ))}
                </div>

                <button
                    onClick={() => onAdd(item)}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        gap: '0.5rem',
                        padding: '0.6rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <Plus size={16} /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default FoodCard;
