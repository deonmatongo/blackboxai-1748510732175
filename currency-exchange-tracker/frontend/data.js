// Currency data management and cart functionality
class CurrencyDataManager {
    constructor() {
        this.exchangeRates = {};
        this.cart = [];
        this.conversionHistory = [];
    }

    // Initialize exchange rates
    async initializeRates() {
        try {
            const response = await fetch(`${API_BASE_URL}/currency`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message);
            
            this.exchangeRates = data.currencies.reduce((acc, curr) => {
                acc[curr.code] = curr.rate;
                return acc;
            }, {});

            this.updateExchangeRatesDisplay();
        } catch (error) {
            showError('Failed to load exchange rates');
            console.error(error);
        }
    }

    // Update exchange rates display
    updateExchangeRatesDisplay() {
        const container = document.getElementById('exchangeRates');
        if (!container) return;

        container.innerHTML = Object.entries(this.exchangeRates)
            .map(([code, rate]) => `
                <div class="currency-card bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
                    <h3 class="text-lg font-semibold text-gray-800">${code}</h3>
                    <p class="text-gray-600">1 USD = ${rate} ${code}</p>
                </div>
            `).join('');
    }

    // Add to cart
    addToCart(fromCurrency, toCurrency, amount) {
        const conversion = {
            id: Date.now(),
            fromCurrency,
            toCurrency,
            amount,
            rate: this.exchangeRates[toCurrency] / this.exchangeRates[fromCurrency],
            timestamp: new Date()
        };

        this.cart.push(conversion);
        this.updateCartDisplay();
        this.saveCart();
    }

    // Remove from cart
    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.updateCartDisplay();
        this.saveCart();
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('currencyCart', JSON.stringify(this.cart));
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('currencyCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartDisplay();
        }
    }

    // Update cart display
    updateCartDisplay() {
        const cartContainer = document.getElementById('cartItems');
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<p class="text-gray-500">Your cart is empty</p>';
            return;
        }

        cartContainer.innerHTML = this.cart
            .map(item => `
                <div class="bg-white p-4 rounded-lg shadow mb-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">${item.amount} ${item.fromCurrency} to ${item.toCurrency}</p>
                            <p class="text-sm text-gray-600">Rate: ${item.rate}</p>
                            <p class="text-sm text-gray-500">${new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <button onclick="currencyManager.removeFromCart(${item.id})" 
                            class="text-red-600 hover:text-red-800">
                            Remove
                        </button>
                    </div>
                </div>
            `).join('');

        // Update total if needed
        this.updateCartTotal();
    }

    // Update cart total
    updateCartTotal() {
        const totalElement = document.getElementById('cartTotal');
        if (!totalElement) return;

        const total = this.cart.reduce((sum, item) => {
            return sum + (item.amount * item.rate);
        }, 0);

        totalElement.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Add to conversion history
    addToHistory(conversion) {
        this.conversionHistory.unshift(conversion);
        if (this.conversionHistory.length > 10) {
            this.conversionHistory.pop();
        }
        this.updateHistoryDisplay();
        this.saveHistory();
    }

    // Save history to localStorage
    saveHistory() {
        localStorage.setItem('conversionHistory', JSON.stringify(this.conversionHistory));
    }

    // Load history from localStorage
    loadHistory() {
        const savedHistory = localStorage.getItem('conversionHistory');
        if (savedHistory) {
            this.conversionHistory = JSON.parse(savedHistory);
            this.updateHistoryDisplay();
        }
    }

    // Update history display
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('conversionHistory');
        if (!historyContainer) return;

        if (this.conversionHistory.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500">No conversion history</p>';
            return;
        }

        historyContainer.innerHTML = this.conversionHistory
            .map(conversion => `
                <div class="bg-white p-4 rounded-lg shadow mb-4">
                    <p class="font-semibold">
                        ${conversion.amount} ${conversion.fromCurrency} = 
                        ${(conversion.amount * conversion.rate).toFixed(2)} ${conversion.toCurrency}
                    </p>
                    <p class="text-sm text-gray-600">Rate: ${conversion.rate}</p>
                    <p class="text-sm text-gray-500">${new Date(conversion.timestamp).toLocaleString()}</p>
                </div>
            `).join('');
    }
}

// Initialize currency manager
const currencyManager = new CurrencyDataManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    currencyManager.initializeRates();
    currencyManager.loadCart();
    currencyManager.loadHistory();

    // Add conversion to cart when converting
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        const originalClick = convertBtn.onclick;
        convertBtn.onclick = async () => {
            if (originalClick) await originalClick();
            
            const amount = parseFloat(document.getElementById('amount').value);
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;

            if (!isNaN(amount)) {
                currencyManager.addToCart(fromCurrency, toCurrency, amount);
                currencyManager.addToHistory({
                    fromCurrency,
                    toCurrency,
                    amount,
                    rate: currencyManager.exchangeRates[toCurrency] / currencyManager.exchangeRates[fromCurrency],
                    timestamp: new Date()
                });
            }
        };
    }
});
