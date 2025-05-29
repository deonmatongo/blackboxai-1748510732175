// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Utility functions
const showError = (message, elementId = 'errorMessage') => {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
};

const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Authentication functions
const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = data.user.isAdmin ? 'admin.html' : 'index.html';
    } catch (error) {
        showError(error.message);
    }
};

const register = async (name, email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        showToast('Registration successful! Please login.');
        setTimeout(() => window.location.href = 'login.html', 2000);
    } catch (error) {
        showError(error.message);
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
};

// Currency conversion functions
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    try {
        const response = await fetch(`${API_BASE_URL}/currency/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ amount, fromCurrency, toCurrency })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = `${amount} ${fromCurrency} = ${data.convertedAmount} ${toCurrency}`;
        resultDiv.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    }
};

// Admin functions
const loadCurrencies = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/currency`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        const tableBody = document.getElementById('currencyTableBody');
        tableBody.innerHTML = data.currencies.map(currency => `
            <tr>
                <td class="px-6 py-4">${currency.code}</td>
                <td class="px-6 py-4">${currency.rate}</td>
                <td class="px-6 py-4">${new Date(currency.updatedAt).toLocaleString()}</td>
                <td class="px-6 py-4">
                    <button onclick="updateCurrency('${currency.code}')" 
                        class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onclick="deleteCurrency('${currency.code}')" 
                        class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
};

const addCurrency = async (code, rate) => {
    try {
        const response = await fetch(`${API_BASE_URL}/currency`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ code, rate })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        showToast('Currency added successfully');
        loadCurrencies();
    } catch (error) {
        showError(error.message);
    }
};

const updateCurrency = async (code) => {
    const newRate = prompt('Enter new exchange rate:');
    if (!newRate) return;

    try {
        const response = await fetch(`${API_BASE_URL}/currency/${code}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ rate: parseFloat(newRate) })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message);
        
        showToast('Currency updated successfully');
        loadCurrencies();
    } catch (error) {
        showError(error.message);
    }
};

const deleteCurrency = async (code) => {
    if (!confirm(`Are you sure you want to delete ${code}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/currency/${code}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
        
        showToast(`${code} deleted successfully`);
        loadCurrencies();
    } catch (error) {
        showError(error.message);
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            register(name, email, password);
        });
    }

    // Currency converter form
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            const amount = document.getElementById('amount').value;
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;
            convertCurrency(amount, fromCurrency, toCurrency);
        });
    }

    // Admin page initialization
    const currencyTableBody = document.getElementById('currencyTableBody');
    if (currencyTableBody) {
        loadCurrencies();
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Add currency form
    const addCurrencyBtn = document.getElementById('addCurrencyBtn');
    if (addCurrencyBtn) {
        addCurrencyBtn.addEventListener('click', () => {
            const code = document.getElementById('currencyCode').value;
            const rate = document.getElementById('exchangeRate').value;
            addCurrency(code, parseFloat(rate));
        });
    }
});

// Check authentication status
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
            window.location.href = 'login.html';
        }
    } else if (window.location.pathname === '/admin.html' && !user.isAdmin) {
        window.location.href = 'index.html';
    }
};

// Initialize authentication check
checkAuth();
