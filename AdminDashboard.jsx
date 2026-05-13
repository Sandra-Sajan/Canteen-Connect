import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LogOut, ClipboardList, Utensils, Plus, Trash2, CheckCircle, Wallet, TrendingUp, TrendingDown, History, Edit, BarChart2, PieChart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const {
        items, orders, transactions, mockUsers, announcements, reviews,
        addToCart, removeFromCart, updateQuantity, clearCart,
        addItem, removeItem, updateItem, updateOrderStatus, togglePaymentStatus, settleOrder, cancelOrder,
        addAnnouncement, removeAnnouncement,
        examMode, toggleExamMode, theme
    } = useApp();
    const [activeTab, setActiveTab] = useState('orders'); // orders, history, menu, finances, notifications, analytics
    const navigate = useNavigate();

    // Form State
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Snacks', description: '', image: '', stock: '50', dietary: 'Veg' });
    const [announcementMsg, setAnnouncementMsg] = useState('');
    const [announcementType, setAnnouncementType] = useState('info');





    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.name && newItem.price) {
            addItem({
                ...newItem,
                price: parseFloat(newItem.price),
                image: newItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' // Default placeholder
            });
            setNewItem({ name: '', price: '', category: 'Snacks', description: '', image: '', stock: '50', dietary: 'Veg' });
            alert('Item Added!');
        }
    };

    const handleAddAnnouncement = (e) => {
        e.preventDefault();
        if (announcementMsg.trim()) {
            addAnnouncement(announcementMsg, announcementType);
            setAnnouncementMsg('');
            alert('Announcement Sent!');
        }
    };

    // Derived Financial Stats
    const totalRevenue = orders
        .filter(o => o.status !== 'Pending')
        .reduce((sum, o) => sum + o.total, 0);

    // Derived Alerts
    const lowStockItems = items.filter(i => i.stock < 10);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const delayedOrders = orders.filter(o => {
        if (o.status === 'Completed' || o.status === 'Cancelled' || o.status === 'Ready') return false;
        const orderTime = new Date(o.date).getTime();
        const diffMins = (now - orderTime) / 60000;
        return diffMins > 15; // 15 mins delay threshold
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>

            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--primary)', textAlign: 'center' }}>
                    Admin Panel
                </h2>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'orders' ? 'var(--primary)' : 'transparent' }}
                    >
                        <ClipboardList size={20} style={{ marginRight: '0.5rem' }} /> Live Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={activeTab === 'history' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'history' ? 'var(--primary)' : 'transparent' }}
                    >
                        <History size={20} style={{ marginRight: '0.5rem' }} /> Order History
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={activeTab === 'menu' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'menu' ? 'var(--primary)' : 'transparent' }}
                    >
                        <Utensils size={20} style={{ marginRight: '0.5rem' }} /> Menu Manager
                    </button>
                    <button
                        onClick={() => setActiveTab('finances')}
                        className={activeTab === 'finances' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'finances' ? 'var(--primary)' : 'transparent' }}
                    >
                        <Wallet size={20} style={{ marginRight: '0.5rem' }} /> Finances
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={activeTab === 'analytics' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'analytics' ? 'var(--primary)' : 'transparent' }}
                    >
                        <BarChart2 size={20} style={{ marginRight: '0.5rem' }} /> Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={activeTab === 'notifications' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'notifications' ? 'var(--primary)' : 'transparent', position: 'relative' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <LogOut size={20} style={{ marginRight: '0.5rem', transform: 'rotate(180deg)' }} /> Notifications {/* Using LogOut rotated as a generic icon if bell not available, or just reuse icon */}
                            {/* Actually let's use a bell icon if available in imports or generic. 
                                The imports have LogOut, ClipboardList, Utensils, Plus, Trash2, CheckCircle, Wallet, TrendingUp, TrendingDown, History, Edit. 
                                No Bell. I'll use CheckCircle temporarily or just Text. 
                                Actually, I can import Bell from lucide-react if I want, but let's stick to existing or add it to imports.
                                It's safer to add it to imports. I'll do that in a separate replacement or just use existing.
                                Let's use 'Edit' for now as 'Announcements/Notes', or just Text. 
                             */}
                            <span style={{ marginRight: '0.5rem' }}>🔔</span> Alerts & News
                        </div>
                        {(lowStockItems.length > 0 || delayedOrders.length > 0) && (
                            <span style={{
                                position: 'absolute', top: 5, right: 5,
                                width: '10px', height: '10px', backgroundColor: 'var(--danger)', borderRadius: '50%'
                            }}></span>
                        )}
                    </button>
                </nav>

                <button onClick={handleLogout} className="btn-outline" style={{ marginTop: 'auto', justifyContent: 'center' }}>
                    <LogOut size={20} style={{ marginRight: '0.5rem' }} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

                {activeTab === 'orders' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="page-title" style={{ marginBottom: 0 }}>Live Orders</h2>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length === 0 ? <p className="text-muted">No active orders.</p> : orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map(order => (
                                <div key={order.id} className="card" style={{ borderLeft: order.status === 'Pending' ? '4px solid var(--accent)' : '4px solid var(--success)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.date).toLocaleString()}</span>
                                                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>User: {order.userId}</span>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                {order.items.map((i, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.9rem' }}>
                                                        {i.qty}x {i.name}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Total: ₹{order.total}</div>

                                            {/* Mini Calculator for Bill (PayAtCounter Only) */}
                                            {order.paymentMethod === 'PayAtCounter' && (
                                                <div style={{
                                                    backgroundColor: 'var(--bg-dark)',
                                                    padding: '0.5rem',
                                                    borderRadius: '0.5rem',
                                                    marginTop: '0.5rem',
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            placeholder="Cash Received"
                                                            className="input"
                                                            style={{ width: '120px', padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                const changeElement = document.getElementById(`change-${order.id}`);
                                                                if (!isNaN(val)) {
                                                                    const change = val - order.total;
                                                                    changeElement.innerText = `Change: ₹${change}`;
                                                                    changeElement.style.color = change >= 0 ? 'var(--success)' : 'var(--danger)';
                                                                } else {
                                                                    changeElement.innerText = 'Change: -';
                                                                    changeElement.style.color = 'var(--text-muted)';
                                                                }
                                                            }}
                                                        />
                                                        <span id={`change-${order.id}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                            Change: -
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '999px',
                                                backgroundColor: order.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-dark)',
                                                color: order.status === 'Completed' ? 'var(--success)' :
                                                    order.status === 'Cooking' ? 'var(--primary)' :
                                                        order.status === 'Ready' ? 'var(--success)' : 'var(--text-muted)',
                                                border: order.status === 'Cooking' ? '1px solid var(--primary)' :
                                                    order.status === 'Ready' ? '1px solid var(--success)' : '1px solid transparent',
                                                fontSize: '0.8rem'
                                            }}>
                                                {order.status}
                                            </span>

                                            {/* Pay at Counter Payment Status Toggle */}
                                            {order.paymentMethod === 'PayAtCounter' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <label style={{ fontSize: '0.8rem', color: order.paymentCollected ? 'var(--success)' : 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={order.paymentCollected}
                                                            onChange={() => togglePaymentStatus(order.id)}
                                                        />
                                                        {order.paymentCollected ? 'Paid' : 'Unpaid'}
                                                    </label>
                                                </div>
                                            )}

                                            {/* Pay Later Debt Settlement */}
                                            {order.paymentMethod === 'Pay Later' && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    {order.paymentCollected ? (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold' }}>Debt Settled ✅</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Settle debt of ₹${order.total} for ${order.userId}? This will add money to their wallet.`)) {
                                                                    settleOrder(order.id, order.userId, order.total);
                                                                }
                                                            }}
                                                            className="btn-outline"
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                padding: '0.25rem 0.5rem',
                                                                color: 'var(--accent)',
                                                                borderColor: 'var(--accent)'
                                                            }}
                                                        >
                                                            Collect Cash & Settle
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Order Status Action Buttons */}
                                            {order.status !== 'Completed' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                                                    {/* Admin Cancel Button */}
                                                    {order.status === 'Pending' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Cancel Order #${order.id}? This will refund the user.`)) {
                                                                    cancelOrder(order.id);
                                                                }
                                                            }}
                                                            className="btn-outline"
                                                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem' }}
                                                        >
                                                            ❌ Cancel Order
                                                        </button>
                                                    )}

                                                    {/* State Change Buttons */}
                                                    {order.status !== 'Ready' && (
                                                        <button
                                                            onClick={() => {
                                                                let nextStatus = 'Cooking';
                                                                if (order.status === 'Cooking') nextStatus = 'Ready';
                                                                updateOrderStatus(order.id, nextStatus);
                                                            }}
                                                            className="btn"
                                                            style={{
                                                                backgroundColor: order.status === 'Pending' ? 'var(--accent)' : 'var(--primary)',
                                                                color: 'white',
                                                                padding: '0.5rem 1rem',
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            {order.status === 'Pending' && 'Start Cooking 🍳'}
                                                            {order.status === 'Cooking' && 'Mark Ready ✅'}
                                                        </button>
                                                    )}

                                                    {/* Ready State - OTP Verification */}
                                                    {order.status === 'Ready' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter OTP"
                                                                className="input"
                                                                maxLength="4"
                                                                style={{ width: '80px', padding: '0.25rem', fontSize: '0.9rem', textAlign: 'center' }}
                                                                id={`otp-input-${order.id}`}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const inputOtp = document.getElementById(`otp-input-${order.id}`).value;
                                                                    if (inputOtp === order.otp) {
                                                                        updateOrderStatus(order.id, 'Completed');
                                                                        alert("OTP Verified! Order Completed. ✅");
                                                                    } else {
                                                                        alert("Incorrect OTP! ❌");
                                                                    }
                                                                }}
                                                                className="btn btn-primary"
                                                                style={{ flex: 1, padding: '0.25rem', fontSize: '0.8rem' }}
                                                            >
                                                                Verify & Complete
                                                            </button>
                                                            {/* Bypass for demo/testing */}
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'Completed')}
                                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}
                                                                title="Force Complete (Bypass OTP)"
                                                            >
                                                                Skip
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <h2 className="page-title">Order History</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').length === 0 ? (
                                <p className="text-muted">No order history available.</p>
                            ) : (
                                orders
                                    .filter(o => o.status === 'Completed' || o.status === 'Cancelled')
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map(order => (
                                        <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.date).toLocaleString()}</span>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>User: {order.userId}</span>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                </div>
                                                {/* Reviews */}
                                                {(() => {
                                                    const orderReview = reviews.find(r => r.orderId === order.id);
                                                    const displayRating = orderReview?.rating || order.rating;
                                                    const displaySuggestion = orderReview?.suggestion || order.review;
                                                    if (!displayRating) return null;
                                                    return (
                                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'gold' }}>
                                                            {'★'.repeat(displayRating)}{'☆'.repeat(5 - displayRating)}
                                                            {displaySuggestion && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>"{displaySuggestion}"</span>}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--success)' }}>₹{order.total}</div>
                                                <div style={{
                                                    marginTop: '0.5rem',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    backgroundColor: order.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: order.status === 'Completed' ? 'var(--success)' : 'var(--danger)',
                                                    fontSize: '0.8rem',
                                                    display: 'inline-block'
                                                }}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div>
                        <h2 className="page-title">Menu Manager</h2>

                        {/* Add Item Form */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Add New Item</h3>
                            <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input required className="input" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                                <input required className="input" type="number" placeholder="Price (₹)" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                                <input className="input" placeholder="Category" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                                <input type="number" className="input" placeholder="Initial Stock" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: e.target.value })} />
                                <select className="input" value={newItem.dietary} onChange={e => setNewItem({ ...newItem, dietary: e.target.value })}>
                                    <option value="Veg">Veg</option>
                                    <option value="Non-Veg">Non-Veg</option>
                                    <option value="Egg">Egg</option>
                                </select>
                                <input className="input" placeholder="Image URL (Optional)" value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })} />
                                <input className="input" style={{ gridColumn: 'span 2' }} placeholder="Description" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                                <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
                                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add to Menu
                                </button>
                            </form>
                        </div>

                        {/* Existing Items */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {items.map(item => (
                                <div key={item.id} className="card" style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        style={{
                                            position: 'absolute', top: 10, right: 10,
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
                                            padding: '0.5rem', borderRadius: '50%'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <h4 style={{ fontWeight: 'bold' }}>{item.name}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>₹</span>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) })}
                                                style={{ width: '60px', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', padding: 0 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-dark)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stock:</span>
                                            <input
                                                type="number"
                                                value={item.stock || 50}
                                                onChange={(e) => updateItem(item.id, { stock: parseInt(e.target.value) })}
                                                style={{ width: '50px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
                                            />
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{item.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'finances' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <h2 className="page-title">Financial Overview</h2>

                        {/* SUMMARY CARDS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--bg-card))' }}>
                                <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Total Revenue</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{totalRevenue}</p>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Registered Users</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{mockUsers.length}</p>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total Transactions</h3>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{transactions.length}</p>
                            </div>
                        </div>

                        {/* CALCULATOR TOOL */}
                        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wallet size={20} color="var(--primary)" />
                                Quick Change Calculator
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Bill Amount (₹)</label>
                                    <input type="number" id="calc-bill" className="input" placeholder="e.g 150" />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Cash Given (₹)</label>
                                    <input type="number" id="calc-given" className="input" placeholder="e.g 500" />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const bill = parseFloat(document.getElementById('calc-bill').value) || 0;
                                        const given = parseFloat(document.getElementById('calc-given').value) || 0;
                                        const change = given - bill;
                                        document.getElementById('calc-result').innerText = `Return: ₹${change}`;
                                        document.getElementById('calc-result').style.color = change >= 0 ? 'var(--success)' : 'var(--danger)';
                                    }}
                                >
                                    Calculate
                                </button>
                                <div id="calc-result" style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '150px' }}>
                                    Return: ₹0
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                            {/* TRANSACTION LOG */}
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Recent Transactions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                    {transactions.length === 0 ? <p className="text-muted">No transactions recorded.</p> : transactions.map(t => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {t.type === 'Credit' ? <TrendingUp size={16} color="var(--success)" /> : (t.type === 'Info' ? <CheckCircle size={16} color="var(--accent)" /> : <TrendingDown size={16} color="var(--danger)" />)}
                                                <div>
                                                    <div style={{ fontSize: '0.9rem' }}>{t.desc}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {new Date(t.date).toLocaleTimeString()} • {t.userId}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: '600', color: t.type === 'Credit' ? 'var(--success)' : (t.type === 'Info' ? 'var(--accent)' : 'var(--danger)') }}>
                                                {t.type === 'Credit' ? '+' : (t.type === 'Info' ? '' : '-')}₹{t.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <h2 className="page-title">Alerts & Announcements</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>
                            {/* ALERTS SECTION */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* LOW STOCK */}
                                <div className="card" style={{ borderColor: 'var(--danger)', borderWidth: '1px' }}>
                                    <h3 style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingDown size={20} /> Low Stock Alerts
                                    </h3>
                                    {lowStockItems.length === 0 ? (
                                        <p className="text-muted">All items well stocked.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {lowStockItems.map(item => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.stock} left</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* DELAYED ORDERS */}
                                <div className="card" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
                                    <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <History size={20} /> Delayed Orders (&gt;15m)
                                    </h3>
                                    {delayedOrders.length === 0 ? (
                                        <p className="text-muted">No orders running late.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {delayedOrders.map(order => (
                                                <div key={order.id} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                                                        <span style={{ color: 'var(--accent)' }}>{Math.floor((Date.now() - new Date(order.date).getTime()) / 60000)}m ago</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {order.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ANNOUNCEMENTS SECTION */}
                            <div>
                                <div className="card" style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>📢 Send Announcement</h3>
                                    <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <textarea
                                            className="input"
                                            rows="3"
                                            placeholder="Type your message (e.g., 'Lunch delay', '50% Off Special')"
                                            value={announcementMsg}
                                            onChange={(e) => setAnnouncementMsg(e.target.value)}
                                            required
                                        ></textarea>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <select
                                                className="input"
                                                value={announcementType}
                                                onChange={(e) => setAnnouncementType(e.target.value)}
                                                style={{ flex: 1 }}
                                            >
                                                <option value="info">ℹ️ Info</option>
                                                <option value="warning">⚠️ Warning</option>
                                                <option value="offer">🎉 Offer</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send</button>
                                        </div>
                                    </form>
                                </div>

                                <div className="card">
                                    <h3 style={{ marginBottom: '1rem' }}>Active Announcements</h3>
                                    {announcements.length === 0 ? (
                                        <p className="text-muted">No active announcements.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {announcements.map(ann => (
                                                <div key={ann.id} style={{
                                                    padding: '1rem',
                                                    borderRadius: '0.5rem',
                                                    backgroundColor:
                                                        ann.type === 'warning' ? 'rgba(239, 68, 68, 0.1)' :
                                                            ann.type === 'offer' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    border:
                                                        ann.type === 'warning' ? '1px solid var(--danger)' :
                                                            ann.type === 'offer' ? '1px solid var(--primary)' : '1px solid var(--accent)',
                                                    position: 'relative'
                                                }}>
                                                    <button
                                                        onClick={() => removeAnnouncement(ann.id)}
                                                        style={{ position: 'absolute', top: 5, right: 5, color: 'var(--text-muted)', background: 'transparent' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                        {ann.type === 'warning' ? '⚠️ Alert' : ann.type === 'offer' ? '🎉 Offer' : 'ℹ️ Info'}
                                                    </div>
                                                    <p>{ann.message}</p>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                        {new Date(ann.date).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <h2 className="page-title">Business Intelligence 🧠</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            {/* SALES PREDICTION - AI MOCK */}
                            <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)', color: 'white' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <TrendingUp /> AI Sales Prediction
                                </h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Based on last week's trend:</p>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹{Math.floor(totalRevenue * 1.2)}</div>
                                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    💡 Insight: Orders peak between 1 PM - 2 PM. Consider running a "Happy Hour" at 4 PM to boost evening sales.
                                </div>
                            </div>

                            {/* DEMAND FORECASTING - SIMPLE MOVING AVERAGE */}
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>📈 Prep Forecast (Tomorrow)</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '0.5rem' }}>Item</th>
                                            <th style={{ padding: '0.5rem' }}>Trend</th>
                                            <th style={{ padding: '0.5rem' }}>Rec. Prep</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.slice(0, 5).map(item => {
                                            // Mock demand logic (Deterministic)
                                            const trend = item.id % 2 === 0 ? 'Up' : 'Stable';
                                            const baseDemand = (item.id * 7) % 20 + 10;
                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.5rem' }}>{item.name}</td>
                                                    <td style={{ padding: '0.5rem', color: trend === 'Up' ? 'var(--success)' : 'var(--text-muted)' }}>
                                                        {trend === 'Up' ? '↗ Increasing' : '→ Stable'}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{Math.floor(baseDemand * 1.1)} units</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* HOURLY HEATMAP */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History /> Order Heatmap (Peak Hours)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                                {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'].map((time, idx) => {
                                    // Mock intensity based on typical lunch hours (12-2)
                                    let intensity = 20;
                                    if (idx === 3 || idx === 4) intensity = 90; // 12pm, 1pm
                                    if (idx === 5) intensity = 60; // 2pm
                                    if (idx === 0) intensity = 10; // 9am

                                    const color = intensity > 80 ? 'var(--danger)' : intensity > 50 ? 'var(--accent)' : 'var(--success)';
                                    return (
                                        <div key={time} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{
                                                height: '100px',
                                                width: '100%',
                                                backgroundColor: 'var(--bg-dark)',
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                borderRadius: '0.5rem',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: `${intensity}%`,
                                                    backgroundColor: color,
                                                    transition: 'height 1s'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* PROFIT MARGIN ANALYSIS */}
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <PieChart /> Profitability Analysis
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--bg-dark)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem' }}>Rank</th>
                                            <th style={{ padding: '0.75rem' }}>Item Name</th>
                                            <th style={{ padding: '0.75rem' }}>Selling Price</th>
                                            <th style={{ padding: '0.75rem' }}>Est. Cost</th>
                                            <th style={{ padding: '0.75rem' }}>Profit Margin</th>
                                            <th style={{ padding: '0.75rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => {
                                            const cost = Math.floor(item.price * 0.6); // Mock cost
                                            const margin = item.price - cost;
                                            const marginPercent = Math.floor((margin / item.price) * 100);
                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem' }}>#{index + 1}</td>
                                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{item.name}</td>
                                                    <td style={{ padding: '0.75rem' }}>₹{item.price}</td>
                                                    <td style={{ padding: '0.75rem' }}>₹{cost}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{
                                                            padding: '0.2rem 0.5rem', borderRadius: '0.5rem',
                                                            backgroundColor: marginPercent > 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                                            color: marginPercent > 50 ? 'var(--success)' : 'var(--accent)'
                                                        }}>
                                                            {marginPercent}% (₹{margin})
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        {marginPercent < 30 ? (
                                                            <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>Review Price ⚠️</button>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}


            </main>
        </div>
    );
};

export default AdminDashboard;
