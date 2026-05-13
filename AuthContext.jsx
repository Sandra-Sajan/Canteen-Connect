import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('canteen_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Auth Load Error", e);
            return null;
        }
    });

    // Poll for user updates (Balance Sync)
    useEffect(() => {
        if (!user?.id) return;

        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/auth/${user.id}`);
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};

                if (data.success && data.user) {
                    // Only update if wallet or points changed to avoid unnecessary re-renders
                    // Actually, easiest is to just check JSON stringify or specific fields
                    setUser(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(data.user)) {
                            localStorage.setItem('canteen_user', JSON.stringify(data.user));
                            return data.user;
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error("Auth Sync Error", err);
            }
        };

        const interval = setInterval(fetchUser, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);


    const login = async (role, credentials) => {
        try {
            console.log(`AuthContext: Logging in as ${role}`, credentials);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: credentials.id, pass: credentials.pass })
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            console.log("AuthContext: Login API Response", data);

            if (data.success) {
                // Check role if Admin access required
                if (role === 'admin' && data.user.role !== 'admin') {
                    console.warn("AuthContext: Admin Access Denied for user", data.user);
                    return { success: false, message: 'Access Denied: Not an Admin' };
                }

                setUser(data.user);
                localStorage.setItem('canteen_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("AuthContext: Login Error:", error);
            return { success: false, message: error.message || 'Connection Failed' };
        }
    };

    const register = async (userDetails) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userDetails.id,
                    name: userDetails.name,
                    pass: userDetails.pass
                })
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('canteen_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: error.message || 'Connection Failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('canteen_user');
    };

    const updateLocalWallet = (newBalance) => {
        setUser(prev => {
            const updated = { ...prev, wallet: newBalance };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    const updateUserPreferences = (newPrefs) => {
        setUser(prev => {
            const updated = { ...prev, preferences: newPrefs };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    const updateUserLoyalty = (newLoyalty) => {
        setUser(prev => {
            const updated = { ...prev, loyalty: newLoyalty };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    const updateProfile = (updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('canteen_user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateLocalWallet, updateUserPreferences, updateUserLoyalty, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
