import { useState, useEffect } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('accessToken');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }

        // Check dark mode preference
        const darkMode = sessionStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkMode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const handleLoginSuccess = (userData: any) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleRegisterSuccess = (userData: any) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        sessionStorage.setItem('darkMode', String(newDarkMode));
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (!isAuthenticated) {
        return showRegister ? (
            <Register
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setShowRegister(false)}
            />
        ) : (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setShowRegister(true)}
            />
        );
    }

    return (
        <Dashboard
            user={user}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
        />
    );
}

export default App;
