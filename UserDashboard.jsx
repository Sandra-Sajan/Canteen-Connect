import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import FoodCard from '../components/FoodCard';
import Chatbot from '../components/Chatbot';
import { LogOut, ShoppingBag, Wallet, History, Menu as MenuIcon, CreditCard, Trash2, CheckCircle, Home, Info, Mic, Search, Moon, Sun, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, logout, updateLocalWallet, updateUserPreferences, updateUserLoyalty, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('home'); // home, menu, cart, orders, wallet, settings
    const navigate = useNavigate();

    useEffect(() => {
        if (!user && !localStorage.getItem('canteen_user')) {
            navigate('/');
        }
    }, [user, navigate]);

    const {
        items, cart, addToCart, removeFromCart, updateQuantity, placeOrder, orders, addMoney, addReview, reorder, announcements, cancelOrder, transactions,
        theme, toggleTheme, language, changeLanguage, t, examMode
    } = useApp();

    const [ratingModal, setRatingModal] = useState({ show: false, orderId: null });
    const [tempRating, setTempRating] = useState(5);
    const [tempSuggestion, setTempSuggestion] = useState('');

    // Advanced Ordering States
    const [isGroupOrder, setIsGroupOrder] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Wallet');
    const [splitCount, setSplitCount] = useState(1);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCartSidebar, setShowCartSidebar] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Notification System
    const [notifications, setNotifications] = useState([]);
    const [showToast, setShowToast] = useState(null); // { message, type }
    const [shareLink, setShareLink] = useState('');

    useEffect(() => {
        setShareLink(`https://canteen.app/join/${Math.random().toString(36).substring(7)}`);
    }, []);

    const triggerNotification = (msg) => {
        setShowToast({ message: msg, type: 'info' });
        // Add to list
        setNotifications(prev => [{ id: Date.now(), message: msg, time: new Date() }, ...prev]);
        // Auto hide toast
        setTimeout(() => setShowToast(null), 5000);
    };

    // Auto-Reminders Logic
    useEffect(() => {
        const checkBreakTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            // Define Break Times: 11:00 (Morning), 13:00 (Lunch), 16:00 (Tea)
            // We check if it is exactly the start of the break (0-5 timeframe to ensure we catch it)
            // AND we haven't notified yet (using session storage to debounce)

            const breaks = [
                { h: 11, m: 0, msg: "🌞 Morning Break Started! Grab a snack?" },
                { h: 13, m: 0, msg: "🍱 Lunch Time! Don't forget to eat." },
                { h: 16, m: 0, msg: "☕ Tea Break! Time to recharge." },
                // For Demo: Trigger if minutes % 5 === 0 (every 5 mins)
                // { h: hours, m: minutes, msg: "🔔 Demo Reminder: Drink Water!" } 
            ];

            const currentBreak = breaks.find(b => b.h === hours && b.m === minutes);
            if (currentBreak) {
                const key = `notified_${now.toDateString()}_${currentBreak.h}`;
                if (!sessionStorage.getItem(key)) {
                    triggerNotification(currentBreak.msg);
                    sessionStorage.setItem(key, 'true');
                }
            }
        };

        const timer = setInterval(checkBreakTime, 30000); // Check every 30s
        checkBreakTime(); // Initial check

        return () => clearInterval(timer);
    }, []);

    // Settings State
    const [tempBirthday, setTempBirthday] = useState('');
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Bill Modal State
    const [billModal, setBillModal] = useState(null); // stores order object to view

    // Sync tempBirthday when user loads
    // Sync tempBirthday when user loads
    useEffect(() => {
        if (user?.loyalty?.birthday) {
            setTempBirthday(user.loyalty.birthday);
        }
        if (user) {
            setTempName(user.name || '');
            setTempEmail(user.email || '');
            setTempPhone(user.phone || '');
            setTempPassword(user.password || '');
        }
    }, [user]);

    // Break Time Reminders (11 AM, 1 PM, 4 PM)
    useEffect(() => {
        const lastNotified = localStorage.getItem('lastBreakNotification');

        const checkTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const today = now.toDateString();

            // Times: 11:00, 13:00 (1PM), 16:00 (4PM)
            const isBreakTime = (hour === 11 || hour === 13 || hour === 16) && minutes === 0;

            if (isBreakTime) {
                const key = `${today}-${hour}`;
                if (lastNotified !== key) {
                    setShowToast({ message: "⏰ It's Break Time! Grab a snack!" });
                    // Optional: Play sound
                    // const audio = new Audio('/notification.mp3'); audio.play().catch(e => console.log(e));
                    localStorage.setItem('lastBreakNotification', key);

                    // Clear toast after 5 seconds
                    setTimeout(() => setShowToast(null), 5000);
                }
            }
        };

        const interval = setInterval(checkTime, 10000); // Check every 10 seconds
        checkTime(); // Initial check

        return () => clearInterval(interval);
    }, []);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsListening(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : language === 'ml' ? 'ml-IN' : 'en-US';
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchTerm(transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            alert("Voice search not supported in this browser.");
        }
    };

    // Mock Time Slots
    const timeSlots = [
        { time: '12:00 PM', status: 'Available' },
        { time: '12:15 PM', status: 'Busy' },
        { time: '12:30 PM', status: 'Available' },
        { time: '12:45 PM', status: 'Available' },
        { time: '01:00 PM', status: 'Busy' },
        { time: '01:15 PM', status: 'Available' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Filter States
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDietary, setFilterDietary] = useState('All');
    const [filterPrice, setFilterPrice] = useState(200);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (!user) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)' }}>Loading...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Top Navbar */}
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--border)',
                padding: '1rem'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>St. Thomas College of Engineering and Technology</span>
                            <span>
                                {t('hello')}, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</span>
                                <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem' }} title={`Level: ${user?.loyalty?.badge || 'Bronze'}`}>
                                    {user?.loyalty?.badge === 'Gold' ? '🥇' : user?.loyalty?.badge === 'Silver' ? '🥈' : '🥉'}
                                </span>
                            </span>
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--bg-dark)',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            border: '1px solid var(--border)'
                        }}>
                            <Wallet size={18} className="text-primary" style={{ color: 'var(--primary)' }} />
                            <span style={{ fontWeight: '600' }}>₹{user?.wallet}</span>
                        </div>
                        <button onClick={() => setActiveTab('settings')} className="btn-outline" style={{ padding: '0.5rem', marginRight: '0.5rem' }}>
                            ⚙️
                        </button>
                        <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Exam Mode Banner */}
            {examMode && (
                <div className="container" style={{ marginTop: '1rem' }}>
                    <div style={{
                        backgroundColor: 'var(--danger)', color: 'white',
                        padding: '0.75rem', textAlign: 'center', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)', borderRadius: '8px'
                    }}>
                        <span>🛑 EXAM MODE ACTIVE</span>
                        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                            | Limited Menu (Snacks/Drinks) | No Orders after 11:00 AM
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>

                {/* Announcements */}
                {announcements && announcements.length > 0 && (
                    <section style={{ marginBottom: '2rem' }}>
                        {announcements.map(ann => (
                            <div key={ann.id} style={{
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                backgroundColor:
                                    ann.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' :
                                        ann.type === 'offer' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                border:
                                    ann.type === 'warning' ? '1px solid var(--danger)' :
                                        ann.type === 'offer' ? '1px solid var(--primary)' : '1px solid var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>
                                    {ann.type === 'warning' ? '⚠️' : ann.type === 'offer' ? '🎉' : 'ℹ️'}
                                </span>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        {ann.type === 'warning' ? 'Alert' : ann.type === 'offer' ? 'Special Offer' : 'Notice'}
                                    </div>
                                    <div>{ann.message}</div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Active Orders Horizontal Scroll */}
                {orders.filter(o => o && o.userId == user?.id && ['Pending', 'Cooking', 'Ready'].includes(o.status)).length > 0 && (
                    <section style={{ marginBottom: '2rem' }}>
                        <h3 className="page-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('live_orders')}</h3>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            overflowX: 'auto',
                            paddingBottom: '0.5rem',
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none' // IE/Edge
                        }} className="hide-scrollbar">
                            {orders.filter(o => o && o.userId == user?.id && ['Pending', 'Cooking', 'Ready'].includes(o.status)).map(order => (
                                <div key={order.id} className="card" style={{
                                    minWidth: '300px',
                                    padding: '1rem',
                                    border: '1px solid var(--border)',
                                    background: 'linear-gradient(to bottom right, var(--bg-card), rgba(99, 102, 241, 0.05))'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '999px',
                                            backgroundColor: 'var(--primary)',
                                            color: 'white'
                                        }}>{order.status}</span>
                                    </div>

                                    {/* Visual Stepper */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                                        {['Pending', 'Cooking', 'Ready'].map((step, idx) => {
                                            const steps = ['Pending', 'Cooking', 'Ready'];
                                            const currentIdx = steps.indexOf(order.status);
                                            // const stepIdx = steps.indexOf(step); // Unused
                                            const isActive = steps.indexOf(step) <= currentIdx;

                                            return (
                                                <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                    <div style={{
                                                        width: '12px', height: '12px', borderRadius: '50%',
                                                        backgroundColor: isActive ? 'var(--success)' : 'var(--bg-card)',
                                                        border: `2px solid ${isActive ? 'var(--success)' : 'var(--text-muted)'}`,
                                                        transition: 'all 0.3s'
                                                    }}></div>
                                                    <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>{step}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Actions for Pending Orders */}
                                    {order.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Cancel this order? Money will be refunded.")) {
                                                        const res = cancelOrder(order.id);
                                                        if (res.success) alert(res.message);
                                                        else alert(res.message);
                                                    }
                                                }}
                                                className="btn-outline"
                                                style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem' }}
                                            >
                                                ❌ Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Modify Order? This will cancel the current order and add items back to cart.")) {
                                                        cancelOrder(order.id); // Cancel current
                                                        reorder(order.items); // Add to cart
                                                        setActiveTab('cart'); // Go to cart
                                                    }
                                                }}
                                                className="btn-outline"
                                                style={{ flex: 1, borderColor: 'var(--primary)', color: 'var(--primary)', fontSize: '0.8rem', padding: '0.4rem' }}
                                            >
                                                ✏️ Modify
                                            </button>
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.paymentMethod}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {['Cooking', 'Ready'].includes(order.status) && order.otp && (
                                                <div style={{
                                                    fontSize: '0.9rem', fontWeight: 'bold',
                                                    backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)',
                                                    padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px dashed var(--border)'
                                                }}>
                                                    OTP: <span style={{ color: 'var(--primary)' }}>{order.otp}</span>
                                                </div>
                                            )}
                                            <button onClick={() => setBillModal(order)} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: '4px', cursor: 'pointer' }}>📄 Bill</button>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>₹{order.total}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Last Order Summary (If no active orders) */}
                {orders.filter(o => o && o.userId == user?.id && ['Pending', 'Cooking', 'Ready'].includes(o.status)).length === 0 &&
                    orders.filter(o => o && o.userId == user?.id).length > 0 && (
                        <section style={{ marginBottom: '2rem' }}>
                            <h3 className="page-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Last Order</h3>
                            {orders.filter(o => o && o.userId == user?.id).slice(0, 1).map(order => (
                                <div key={order.id} className="card" style={{ padding: '1rem', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                                        <span style={{ color: 'var(--success)' }}>Completed</span>
                                        <button onClick={() => reorder(order.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'none', cursor: 'pointer' }}>
                                            Reorder ↻
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        {/* Birthday Banner */}
                        {user?.loyalty?.birthday && new Date().toISOString().slice(5, 10) === user.loyalty.birthday.slice(5, 10) && (
                            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', color: 'white' }}>
                                <h3 style={{ fontSize: '1.5rem' }}>🎉 Happy Birthday!</h3>
                                <p>Enjoy <b>15% OFF</b> on your orders today!</p>
                            </div>
                        )}

                        {/* Welcome & Balance & Points Hero */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--bg-card))',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('hello')}, {user?.name.split(' ')[0]}!</h2>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('balance')}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{user?.wallet}</div>
                                    <button
                                        onClick={() => {
                                            const amount = prompt("Enter amount to add (₹):");
                                            if (amount && !isNaN(amount)) {
                                                addMoney(amount);
                                            }
                                        }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            color: 'white',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}
                                        title="Add Money"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="card" style={{
                                background: 'linear-gradient(135deg, #f59e0b, var(--bg-card))',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>My Points</h2>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{user?.loyalty?.points || 0}</div>
                                    </div>
                                    <span style={{ fontSize: '2rem' }}>
                                        {user?.loyalty?.badge === 'Gold' ? '🥇' : user?.loyalty?.badge === 'Silver' ? '🥈' : '🥉'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>
                                    {user?.loyalty?.badge || 'Bronze'} Member
                                </div>
                            </div>
                        </div>

                        {/* Daily Specials / Recommended */}
                        <section style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="page-title" style={{ marginBottom: 0 }}>
                                    {user?.preferences?.diet && user?.preferences?.diet !== 'None' ? `${t('for_you')} (${user.preferences.diet})` : t('daily_specials')}
                                </h3>
                                <button onClick={() => setActiveTab('menu')} style={{ color: 'var(--primary)', fontWeight: '600' }}>{t('view_all')}</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {items
                                    .filter(item => {
                                        if (!user?.preferences?.diet || user.preferences.diet === 'None') return true;
                                        if (user.preferences.diet === 'Vegan') return item.tags?.includes('Vegan');
                                        if (user.preferences.diet === 'Vegetarian') return item.dietary === 'Veg' || item.tags?.includes('Vegetarian');
                                        if (user.preferences.diet === 'High-Protein') return item.tags?.includes('High-Protein');
                                        return true;
                                    })
                                    .slice(0, 3)
                                    .map(item => (
                                        <FoodCard key={item.id} item={item} onAdd={(itm) => { addToCart(itm); setShowCartSidebar(true); }} />
                                    ))}
                            </div>
                        </section>

                        {/* Trending Now */}
                        <section style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className="page-title" style={{ marginBottom: 0 }}>{t('trending')}</h3>
                                {user?.loyalty?.badge === 'Gold' && (
                                    <span style={{ backgroundColor: 'gold', color: 'black', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        🥇 Gold Perk: Free Delivery
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {items.slice(2, 4).map(item => (
                                    <FoodCard key={item.id} item={item} onAdd={(itm) => { addToCart(itm); setShowCartSidebar(true); }} />
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div style={{ animation: 'fadeIn 0.5s', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className="page-title" style={{ marginBottom: 0 }}>{t('settings')}</h2>
                            <button onClick={() => setActiveTab('home')} className="btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✕</span>
                            </button>
                        </div>

                        {/* Appearance & Language */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Globe size={18} /> Appearance & Language
                            </h4>
                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{theme === 'dark' ? t('theme_dark') : t('theme_light')}</span>
                                    <button onClick={toggleTheme} className="btn-outline" style={{ padding: '0.5rem' }}>
                                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{t('language')}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => changeLanguage('en')} className={language === 'en' ? 'btn btn-primary' : 'btn-outline'} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>EN</button>
                                        <button onClick={() => changeLanguage('hi')} className={language === 'hi' ? 'btn btn-primary' : 'btn-outline'} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>हि</button>
                                        <button onClick={() => changeLanguage('es')} className={language === 'es' ? 'btn btn-primary' : 'btn-outline'} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>ES</button>
                                        <button onClick={() => changeLanguage('ml')} className={language === 'ml' ? 'btn btn-primary' : 'btn-outline'} style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>മല</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Profile & Preferences 🥗</h2>
                        <div className="card">
                            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Personal Details 👤</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</label>
                                        <input className="input" style={{ width: '100%' }} value={tempName} onChange={(e) => setTempName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</label>
                                        <input className="input" style={{ width: '100%' }} type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</label>
                                        <input className="input" style={{ width: '100%' }} type="tel" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <input
                                                className="input"
                                                style={{ width: '100%', paddingRight: '2.5rem' }}
                                                type={showPassword ? "text" : "password"}
                                                value={tempPassword}
                                                onChange={(e) => setTempPassword(e.target.value)}
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '0.5rem',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-muted)'
                                                }}
                                            >
                                                {showPassword ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`/api/auth/${user.id}/profile`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ name: tempName, email: tempEmail, phone: tempPhone, password: tempPassword })
                                                });
                                                const text = await res.text();
                                                const data = text ? JSON.parse(text) : {};

                                                if (data.success) {
                                                    updateProfile(data.user);
                                                    alert("Profile Updated Successfully! ✅");
                                                } else {
                                                    alert("Failed to update: " + (data.message || "Unknown error"));
                                                }
                                            } catch (err) {
                                                console.error("Profile Update Error:", err);
                                                alert("Network Error");
                                            }
                                        }}
                                    >
                                        Update Details
                                    </button>
                                </div>
                            </div>

                            {/* Birthday Input */}
                            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Birthday 🎂 (For Special Treats)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="date"
                                        className="input"
                                        style={{ flex: 1 }}
                                        value={tempBirthday}
                                        onChange={(e) => setTempBirthday(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            try {
                                                const res = await fetch(`/api/auth/${user.id}/profile`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ birthday: tempBirthday })
                                                });
                                                const text = await res.text();
                                                const data = text ? JSON.parse(text) : {};

                                                if (data.success) {
                                                    // Update local user state with the returned updated user object
                                                    updateProfile(data.user);
                                                    alert("Birthday Saved! 🎂");
                                                } else {
                                                    alert("Failed to save birthday: " + (data.message || "Unknown error"));
                                                }
                                            } catch (err) {
                                                console.error("Birthday Update Error:", err);
                                                alert("Network Error");
                                            }
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('dietary_goal')}</label>
                                <select
                                    className="input"
                                    value={user?.preferences?.diet || 'None'}
                                    onChange={(e) => {
                                        const prefs = user?.preferences || { diet: 'None', allergies: [] };
                                        updateUserPreferences({ ...prefs, diet: e.target.value });
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    <option value="None">No Specific Diet</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Vegan">Vegan</option>
                                    <option value="High-Protein">High Protein</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('allergies')}</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {['Gluten', 'Dairy', 'Egg', 'Nuts', 'Soy'].map(allergen => {
                                        const isActive = user?.preferences?.allergies?.includes(allergen);
                                        return (
                                            <button
                                                key={allergen}
                                                className={isActive ? 'btn btn-primary' : 'btn-outline'}
                                                onClick={() => {
                                                    const prefs = user?.preferences || { diet: 'None', allergies: [] };
                                                    let newAllergies = [...(prefs.allergies || [])];
                                                    if (isActive) {
                                                        newAllergies = newAllergies.filter(a => a !== allergen);
                                                    } else {
                                                        newAllergies.push(allergen);
                                                    }
                                                    updateUserPreferences({ ...prefs, allergies: newAllergies });
                                                }}
                                                style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', borderRadius: '999px' }}
                                            >
                                                {allergen}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                <Info size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Items containing your allergens will be marked with a warning badge.
                            </div>
                        </div>
                    </div>
                )}

                {/* MENU TAB */}
                {activeTab === 'menu' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <h2 className="page-title">{t('todays_menu')}</h2>

                        {/* Search Bar */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={t('search_placeholder')}
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={startListening}
                                className={isListening ? 'btn btn-primary' : 'btn-outline'}
                                style={{ padding: '0.75rem', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
                                title="Voice Search"
                            >
                                <Mic size={20} />
                            </button>
                        </div>
                        {isListening && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>{t('voice_listening')}</p>}

                        {/* Filters */}
                        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Category & Dietary */}
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <select
                                    className="input"
                                    style={{ flex: 1, minWidth: '150px' }}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Beverages">Beverages</option>
                                </select>
                                <select
                                    className="input"
                                    style={{ flex: 1, minWidth: '150px' }}
                                    onChange={(e) => setFilterDietary(e.target.value)}
                                >
                                    <option value="All">All Dietary</option>
                                    <option value="Veg">Veg</option>
                                    <option value="Non-Veg">Non-Veg</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Max Price: ₹{filterPrice}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="10"
                                    value={filterPrice}
                                    onChange={(e) => setFilterPrice(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {items
                                .filter(item => {
                                    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
                                    if (filterDietary !== 'All' && item.dietary !== filterDietary) return false;
                                    if (item.price > filterPrice) return false;
                                    // Search Filter
                                    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                                    return true;
                                })
                                .map(item => (
                                    <FoodCard key={item.id} item={item} onAdd={(itm) => { addToCart(itm); setShowCartSidebar(true); }} />
                                ))}
                        </div>
                    </div>
                )}

                {/* CART TAB */}
                {activeTab === 'cart' && (
                    <div style={{ animation: 'fadeIn 0.5s', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="page-title" style={{ marginBottom: 0 }}>{t('cart')}</h2>
                            <div style={{
                                fontSize: '0.9rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                color: (user?.loyalty?.points || 0) >= 200 ? 'var(--primary)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                💎 {user?.loyalty?.points || 0} pts
                                {(user?.loyalty?.points || 0) >= 500 ? ' (Gold - 10%)' : (user?.loyalty?.points || 0) >= 200 ? ' (Silver - 5%)' : ''}
                            </div>
                        </div>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <ShoppingBag size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>{t('cart_empty')}</p>
                                <button onClick={() => setActiveTab('menu')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    {t('browse_menu')}
                                </button>
                            </div>
                        ) : (
                            <div className="card">
                                {cart.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem 0',
                                        borderBottom: '1px solid var(--border)'
                                    }}>
                                        <div>
                                            <h4 style={{ fontWeight: '600' }}>{item.name}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                ₹{item.price} x {item.qty}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="btn-outline"
                                                    style={{ width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                                                >-</button>
                                                <span style={{ fontWeight: 'bold' }}>{item.qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="btn-outline"
                                                    style={{ width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                                                >+</button>
                                            </div>

                                            <span style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>₹{item.price * item.qty}</span>
                                            <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', background: 'none' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Payment Method</h4>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: paymentMethod === 'Wallet' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', cursor: 'pointer', minWidth: '140px' }}>
                                            <input type="radio" name="payment" checked={paymentMethod === 'Wallet'} onChange={() => setPaymentMethod('Wallet')} />
                                            <span>Wallet</span>
                                        </label>
                                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: paymentMethod === 'PayAtCounter' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', cursor: 'pointer', minWidth: '140px' }}>
                                            <input type="radio" name="payment" checked={paymentMethod === 'PayAtCounter'} onChange={() => setPaymentMethod('PayAtCounter')} />
                                            <span>Pay at Counter</span>
                                        </label>
                                        <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: paymentMethod === 'Pay Later' ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: 'var(--bg-dark)', cursor: 'pointer', minWidth: '140px' }}>
                                            <input type="radio" name="payment" checked={paymentMethod === 'Pay Later'} onChange={() => setPaymentMethod('Pay Later')} />
                                            <span>Pay Later (Credit)</span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Pickup Time (Avoid Rush)</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        {timeSlots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedSlot(slot.time)}
                                                disabled={slot.status === 'Busy'}
                                                className={selectedSlot === slot.time ? 'btn btn-primary' : 'btn-outline'}
                                                style={{
                                                    fontSize: '0.8rem', padding: '0.5rem',
                                                    opacity: slot.status === 'Busy' ? 0.5 : 1,
                                                    cursor: slot.status === 'Busy' ? 'not-allowed' : 'pointer',
                                                    borderColor: selectedSlot === slot.time ? 'var(--primary)' : 'var(--border)'
                                                }}
                                            >
                                                {slot.time}
                                                {slot.status === 'Busy' && <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--danger)' }}>Busy</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* GROUP ORDERING */}
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <label className="switch">
                                                <input type="checkbox" checked={isGroupOrder} onChange={(e) => setIsGroupOrder(e.target.checked)} />
                                                <span className="slider round"></span>
                                            </label>
                                            <span style={{ fontWeight: '600' }}>Group Order</span>
                                        </div>
                                        {isGroupOrder && (
                                            <button onClick={() => setShowShareModal(true)} className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                                                🔗 Share Cart
                                            </button>
                                        )}
                                    </div>

                                    {isGroupOrder && (
                                        <div style={{ animation: 'fadeIn 0.3s' }}>
                                            <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Split Bill 🧾</h5>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>People</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={splitCount}
                                                        onChange={(e) => setSplitCount(parseInt(e.target.value) || 1)}
                                                        className="input"
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'right' }}>
                                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Per Person</label>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                                        ₹{(cartTotal / (splitCount || 1)).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>

                                {/* Calculated Loyalty Discount Display (Visual Only) */}
                                {(user?.loyalty?.points || 0) >= 200 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                        <span>Loyalty Discount ({(user?.loyalty?.points || 0) >= 500 ? '10%' : '5%'})</span>
                                        <span>-₹{Math.floor(cartTotal * ((user?.loyalty?.points || 0) >= 500 ? 0.10 : 0.05))}</span>
                                    </div>
                                )}

                                {/* Birthday Discount Display */}
                                {user?.loyalty?.birthday && new Date().toISOString().slice(5, 10) === user.loyalty.birthday.slice(5, 10) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: '#ec4899' }}>
                                        <span>Birthday Discount (15%)</span>
                                        <span>-₹{Math.floor(cartTotal * 0.15)}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Total Pay</span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {/* Approximated Total for Display - logic matched with provider */}
                                        ₹{Math.floor(cartTotal - (
                                            ((user?.loyalty?.points || 0) >= 500 ? cartTotal * 0.10 : (user?.loyalty?.points || 0) >= 200 ? cartTotal * 0.05 : 0) +
                                            (user?.loyalty?.birthday && new Date().toISOString().slice(5, 10) === user.loyalty.birthday.slice(5, 10) ? cartTotal * 0.15 : 0)
                                        ))}
                                    </span>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (examMode) {
                                            const hour = new Date().getHours();
                                            if (hour >= 11) { // Block after 11 AM
                                                alert("❌ Orders are blocked after 11:00 AM during Exam Mode.");
                                                return;
                                            }
                                        }
                                        const method = paymentMethod;
                                        const pickup = selectedSlot || 'ASAP';
                                        const res = await placeOrder(method, pickup);
                                        if (res.success) {
                                            setActiveTab('orders');
                                            alert(res.message);
                                            // Reset States
                                            setIsGroupOrder(false);
                                            setSplitCount(1);
                                            setSelectedSlot(null);
                                            setPaymentMethod('Wallet');
                                        } else {
                                            alert(res.message);
                                        }
                                    }}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                >
                                    Confirm Order {selectedSlot ? `(${selectedSlot})` : ''}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Share Cart Modal */}
                {showShareModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 100
                    }}>
                        <div className="card" style={{ maxWidth: '300px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.3s' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Scan to Join</h3>
                            <div style={{
                                width: '150px', height: '150px',
                                backgroundColor: 'white', margin: '0 auto 1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'black', fontWeight: 'bold', border: '2px dashed #ccc'
                            }}>
                                [QR CODE]
                            </div>
                            <div style={{ backgroundColor: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: '1rem' }}>
                                {shareLink}
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => alert('Link Copied!')}>Copy Link</button>
                            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setShowShareModal(false)}>Close</button>
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {
                    activeTab === 'orders' && (
                        <div style={{ animation: 'fadeIn 0.5s', maxWidth: '800px', margin: '0 auto' }}>
                            <h2 className="page-title">{t('orders')}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {orders.filter(o => o && o.userId == user.id).length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet.</p>
                                ) : (
                                    orders.filter(o => o && o.userId == user.id).map(order => (
                                        <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id.toString().slice(-4)}</span>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        padding: '0.1rem 0.5rem',
                                                        borderRadius: '999px',
                                                        backgroundColor:
                                                            order.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' :
                                                                order.status === 'Cooking' ? 'rgba(59, 130, 246, 0.1)' :
                                                                    order.status === 'Ready' ? 'rgba(168, 85, 247, 0.1)' :
                                                                        'rgba(16, 185, 129, 0.1)',
                                                        color:
                                                            order.status === 'Pending' ? 'rgb(234, 179, 8)' :
                                                                order.status === 'Cooking' ? 'rgb(59, 130, 246)' :
                                                                    order.status === 'Ready' ? 'rgb(168, 85, 247)' :
                                                                        'rgb(16, 185, 129)',
                                                        border:
                                                            order.status === 'Cooking' ? '1px solid rgb(59, 130, 246)' :
                                                                order.status === 'Ready' ? '1px solid rgb(168, 85, 247)' : 'none'
                                                    }}>
                                                        {order.status === 'Pending' ? 'Received' : order.status}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {new Date(order.date).toLocaleString()}
                                                </p>
                                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                    {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                                    -₹{order.total}
                                                </span>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    via {order.paymentMethod || 'Wallet'}
                                                </div>
                                                <button
                                                    onClick={() => setBillModal(order)}
                                                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-card)', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                                                >
                                                    📄 Bill
                                                </button>

                                                {/* Reorder Button */}
                                                <button
                                                    onClick={() => {
                                                        reorder(order.items);
                                                        setActiveTab('cart');
                                                        alert('Items added to cart!');
                                                    }}
                                                    className="btn-outline"
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        fontSize: '0.8rem',
                                                        padding: '0.25rem 0.5rem',
                                                        display: 'block',
                                                        width: '100%'
                                                    }}
                                                >
                                                    🔄 Reorder
                                                </button>

                                                {/* Rating Button */}
                                                {order.status === 'Completed' && !order.isRated && (
                                                    <button
                                                        onClick={() => setRatingModal({ show: true, orderId: order.id })}
                                                        className="btn-outline"
                                                        style={{
                                                            marginTop: '0.5rem',
                                                            fontSize: '0.8rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderColor: 'var(--primary)',
                                                            color: 'var(--primary)'
                                                        }}
                                                    >
                                                        Rate Meal ⭐
                                                    </button>
                                                )}
                                                {order.isRated && (
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        Thanks for feedback!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Rating Modal */}
                {
                    ratingModal.show && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 100
                        }}>
                            <div className="card" style={{ maxWidth: '400px', width: '90%', animation: 'fadeIn 0.3s' }}>
                                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Rate Your Meal</h3>

                                {/* Stars */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setTempRating(star)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '2rem',
                                                cursor: 'pointer',
                                                color: star <= tempRating ? 'gold' : 'var(--text-muted)',
                                                transition: 'transform 0.1s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    className="input"
                                    placeholder="Any suggestions or feedback? (Optional)"
                                    rows="3"
                                    style={{ marginBottom: '1rem', width: '100%', resize: 'none' }}
                                    value={tempSuggestion}
                                    onChange={(e) => setTempSuggestion(e.target.value)}
                                />

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                        onClick={() => {
                                            setRatingModal({ show: false, orderId: null });
                                            setTempRating(5);
                                            setTempSuggestion('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={() => {
                                            if (ratingModal.orderId) {
                                                addReview(ratingModal.orderId, tempRating, tempSuggestion);
                                                setRatingModal({ show: false, orderId: null });
                                                setTempRating(5);
                                                setTempSuggestion('');
                                                alert('Thanks for your feedback!');
                                            }
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* WALLET TAB */}
                {
                    activeTab === 'wallet' && (
                        <div style={{ animation: 'fadeIn 0.5s', maxWidth: '600px', margin: '0 auto' }}>
                            <h2 className="page-title">{t('wallet')}</h2>

                            {/* Balance Card */}
                            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--bg-card))', color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1rem', opacity: 0.9 }}>Available Balance</div>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0' }}>₹{user?.wallet || 0}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Secure & Instant Payments</div>
                            </div>

                            {/* Add Money */}
                            <div className="card" style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Add Money</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                    {[100, 200, 500].map(amt => (
                                        <button
                                            key={amt}
                                            className="btn-outline"
                                            onClick={() => addMoney(amt)}
                                            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                        >
                                            +₹{amt}
                                        </button>
                                    ))}
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => addMoney(1000)}>
                                    Add Custom Amount (Demo: +₹1000)
                                </button>
                            </div>

                            {/* Transactions */}
                            <div className="card">
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>History</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {!user || !transactions || transactions.filter(t => t.userId === user.id).length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center' }}>No transactions yet.</p>
                                    ) : (
                                        transactions
                                            .filter(t => t && t.userId === user.id)
                                            .sort((a, b) => b.id - a.id) // Recent first
                                            .map((tx, idx) => (
                                                <div key={tx.id || idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold' }}>
                                                            {tx.description || 'Unknown Transaction'}
                                                            {(tx.description || '').toLowerCase().includes('refund') && (
                                                                <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--success)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>REFUND</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {tx.date ? new Date(tx.date).toLocaleString() : new Date(tx.id).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        color: tx.type === 'Credit' ? 'var(--success)' : 'var(--danger)',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount || 0}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }



                {/* Bill Modal */}
                {
                    billModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 200
                        }}>
                            <div className="card" style={{ maxWidth: '400px', width: '90%', animation: 'fadeIn 0.3s', padding: 0, overflow: 'hidden' }}>
                                <div style={{ backgroundColor: 'var(--primary)', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Canteen Connect</h3>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Receipt / Tax Invoice</div>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID</div>
                                            <div style={{ fontWeight: 'bold' }}>#{billModal.id}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date</div>
                                            <div style={{ fontWeight: 'bold' }}>{new Date(billModal.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        {billModal.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>{item.qty}x</span>
                                                    <span>{item.name}</span>
                                                </div>
                                                <div>₹{item.price * item.qty}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                                        {billModal.discount > 0 && (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                                    <span>Subtotal</span>
                                                    <span>₹{billModal.subtotal || billModal.total + billModal.discount}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                                    <span>Discount (Birthday)</span>
                                                    <span>-₹{billModal.discount}</span>
                                                </div>
                                            </>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            <span>Total</span>
                                            <span>₹{billModal.total}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <span>Payment Status</span>
                                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>PAID ({billModal.paymentMethod || 'Wallet'})</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={() => setBillModal(null)} className="btn btn-outline" style={{ width: '100%' }}>Close Receipt</button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* SIDEBAR CART */}
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: '350px', maxWidth: '80%',
                    backgroundColor: 'var(--bg-card)', boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
                    transform: showCartSidebar ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    zIndex: 200,
                    padding: '1.5rem',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Your Cart 🛒</h2>
                        <button onClick={() => setShowCartSidebar(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>×</button>
                    </div>

                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Your cart is empty.</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price} x {item.qty}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >-</button>
                                        <span style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '2px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary)' }}>₹{cartTotal}</span>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        setShowCartSidebar(false);
                                        setActiveTab('cart');
                                    }}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {/* Overlay for Sidebar */}
                {
                    showCartSidebar && (
                        <div
                            onClick={() => setShowCartSidebar(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 199 }}
                        />
                    )
                }

                {/* BOTTOM NAVIGATION */}
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-around', padding: '0.8rem',
                    zIndex: 100
                }}>
                    <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem' }}>
                        <Home size={24} />
                        <span>Home</span>
                    </button>
                    <button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: activeTab === 'menu' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem' }}>
                        <MenuIcon size={24} />
                        <span>Menu</span>
                    </button>
                    <button onClick={() => setShowCartSidebar(true)} style={{ background: 'none', border: 'none', color: activeTab === 'cart' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem', position: 'relative' }}>
                        <ShoppingBag size={24} />
                        {cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
                        <span>Cart</span>
                    </button>
                    <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem' }}>
                        <History size={24} />
                        <span>Orders</span>
                    </button>
                    <button onClick={() => setActiveTab('wallet')} style={{ background: 'none', border: 'none', color: activeTab === 'wallet' ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem' }}>
                        <Wallet size={24} />
                        <span>Wallet</span>
                    </button>
                </div>
                {/* Floating Toast Notification */}
                {
                    showToast && (
                        <div style={{
                            position: 'fixed',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            padding: '1rem 2rem',
                            borderRadius: '999px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            zIndex: 1000,
                            animation: 'slideUp 0.3s ease-out',
                            border: '1px solid var(--primary)'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🔔</span>
                            <span style={{ fontWeight: '500' }}>{showToast.message}</span>
                            <button
                                onClick={() => setShowToast(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '0.5rem' }}
                            >
                                ✕
                            </button>
                        </div>
                    )
                }
            </main >
            <Chatbot />
        </div >
    );
};

export default UserDashboard;
