// Cart management and payment processing
class CartManager {
    constructor() {
        this.items = [];
        this.total = 0;
    }

    // Initialize cart
    async initialize() {
        this.loadCart();
        this.updateCartDisplay();
        await this.loadPaymentHistory();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('currencyCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.calculateTotal();
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('currencyCart', JSON.stringify(this.items));
    }

    // Calculate cart total
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.amount * item.rate);
        }, 0);
    }

    // Update cart display
    updateCartDisplay() {
        const cartContainer = document.getElementById('cartContainer');
        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Your cart is empty</p>
                    <a href="index.html" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        Make a conversion
                    </a>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = `
            <div class="space-y-4">
                ${this.items.map(item => `
                    <div class="bg-white p-4 rounded-lg shadow-md">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-semibold">
                                    ${item.amount} ${item.fromCurrency} to ${item.toCurrency}
                                </p>
                                <p class="text-sm text-gray-600">
                                    Rate: ${item.rate}
                                </p>
                                <p class="text-sm text-gray-500">
                                    Total: ${(item.amount * item.rate).toFixed(2)} ${item.toCurrency}
                                </p>
                            </div>
                            <button onclick="cartManager.removeItem(${item.id})" 
                                class="text-red-600 hover:text-red-800">
                                Remove
                            </button>
                        </div>
                    </div>
                `).join('')}
                
                <div class="mt-6 bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-semibold">Total:</p>
                        <p class="text-lg font-semibold">${this.total.toFixed(2)} USD</p>
                    </div>
                </div>

                <div class="mt-6">
                    <button onclick="cartManager.processPayment()" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Proceed to Payment
                    </button>
                </div>
            </div>
        `;
    }

    // Remove item from cart
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.calculateTotal();
        this.saveCart();
        this.updateCartDisplay();
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.total = 0;
        this.saveCart();
        this.updateCartDisplay();
    }

    // Process payment
    async processPayment() {
        try {
            const response = await fetch(`${API_BASE_URL}/payment/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: this.total,
                    items: this.items
                })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message);
            
            showToast('Payment processed successfully!');
            this.clearCart();
            await this.loadPaymentHistory();
            
            // Redirect to success page or show success message
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            showError(error.message);
        }
    }

    // Load payment history
    async loadPaymentHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/payment/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message);
            
            this.updatePaymentHistory(data.payments);
        } catch (error) {
            console.error('Failed to load payment history:', error);
        }
    }

    // Update payment history display
    updatePaymentHistory(payments) {
        const historyContainer = document.getElementById('paymentHistory');
        if (!historyContainer) return;

        if (payments.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500">No payment history</p>';
            return;
        }

        historyContainer.innerHTML = payments
            .map(payment => `
                <div class="bg-white p-4 rounded-lg shadow-md mb-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">Payment #${payment.id}</p>
                            <p class="text-sm text-gray-600">Amount: $${payment.amount}</p>
                            <p class="text-sm text-gray-500">
                                ${new Date(payment.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <span class="px-2 py-1 rounded ${
                            payment.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }">
                            ${payment.status}
                        </span>
                    </div>
                </div>
            `).join('');
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    cartManager.initialize();
});
