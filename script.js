// Sample menu items
const menuItems = [
    { id: 1, name: "Chicken Burger", price: 180 },
    { id: 2, name: "Beef Burger", price: 220 },
    { id: 3, name: "Cheese Burger", price: 200 },
    { id: 4, name: "Chicken Pizza", price: 350 },
    { id: 5, name: "Vegetable Pizza", price: 300 },
    { id: 6, name: "French Fries", price: 100 },
    { id: 7, name: "Chicken Wings", price: 250 },
    { id: 8, name: "Soft Drink", price: 40 },
    { id: 9, name: "Mineral Water", price: 20 },
    { id: 10, name: "Coffee", price: 60 },
    { id: 11, name: "Tea", price: 30 },
    { id: 12, name: "Ice Cream", price: 80 }
];

// Initialize variables
let orders = JSON.parse(localStorage.getItem('rahikCafeOrders')) || [];
let currentOrder = {
    id: generateInvoiceNo(),
    dateTime: getCurrentDateTime(),
    customerName: "",
    customerPhone: "",
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0
};

// DOM elements
const invoiceNoEl = document.getElementById('invoiceNo');
const dateTimeEl = document.getElementById('dateTime');
const customerNameEl = document.getElementById('customerName');
const customerPhoneEl = document.getElementById('customerPhone');
const itemSearchEl = document.getElementById('itemSearch');
const itemSuggestionsEl = document.getElementById('itemSuggestions');
const orderItemsEl = document.getElementById('orderItems');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const discountAmountEl = document.getElementById('discountAmount');
const totalEl = document.getElementById('total');
const searchTermEl = document.getElementById('searchTerm');
const searchResultsEl = document.getElementById('searchResults');
const invoicePreviewEl = document.getElementById('invoicePreview');
const invoiceContentEl = document.getElementById('invoiceContent');

// Buttons
const addItemBtn = document.getElementById('addItemBtn');
const clearOrderBtn = document.getElementById('clearOrderBtn');
const searchBtn = document.getElementById('searchBtn');
const generateBillBtn = document.getElementById('generateBillBtn');
const printBillBtn = document.getElementById('printBillBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');

// Initialize the form
function initForm() {
    invoiceNoEl.value = currentOrder.id;
    dateTimeEl.value = currentOrder.dateTime;
    updateOrderSummary();
}

// Generate invoice number
function generateInvoiceNo() {
    const today = new Date();
    const datePart = today.getFullYear().toString().substr(-2) + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
    const lastOrderNo = orders.length > 0 ? 
        parseInt(orders[orders.length - 1].id.split('-')[1]) : 0;
    return `RC-${(lastOrderNo + 1).toString().padStart(4, '0')}`;
}

// Get current date and time
function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

// Update order summary
function updateOrderSummary() {
    currentOrder.subtotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    currentOrder.discount = parseFloat(discountEl.value) || 0;
    currentOrder.discountAmount = currentOrder.subtotal * (currentOrder.discount / 100);
    currentOrder.total = currentOrder.subtotal - currentOrder.discountAmount;
    
    subtotalEl.value = currentOrder.subtotal.toFixed(2);
    discountAmountEl.value = currentOrder.discountAmount.toFixed(2);
    totalEl.value = currentOrder.total.toFixed(2);
}

// Render order items
function renderOrderItems() {
    orderItemsEl.innerHTML = '';
    
    currentOrder.items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td class="taka">${item.price.toFixed(2)}</td>
            <td><input type="number" min="1" value="${item.quantity}" data-index="${index}" class="item-qty"></td>
            <td class="taka">${(item.price * item.quantity).toFixed(2)}</td>
            <td><button class="danger remove-item" data-index="${index}">Remove</button></td>
        `;
        orderItemsEl.appendChild(tr);
    });
    
    // Add event listeners to quantity inputs
    document.querySelectorAll('.item-qty').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const newQty = parseInt(this.value) || 1;
            currentOrder.items[index].quantity = newQty;
            renderOrderItems();
            updateOrderSummary();
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            currentOrder.items.splice(index, 1);
            renderOrderItems();
            updateOrderSummary();
        });
    });
}

// Show item suggestions
function showItemSuggestions(searchTerm) {
    itemSuggestionsEl.innerHTML = '';
    
    if (!searchTerm) {
        itemSuggestionsEl.classList.add('hidden');
        return;
    }
    
    const filteredItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toString().includes(searchTerm)
    );
    
    if (filteredItems.length === 0) {
        itemSuggestionsEl.classList.add('hidden');
        return;
    }
    
    filteredItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = `${item.name} - ৳${item.price.toFixed(2)}`;
        div.addEventListener('click', () => {
            itemSearchEl.value = item.name;
            itemSuggestionsEl.classList.add('hidden');
        });
        itemSuggestionsEl.appendChild(div);
    });
    
    itemSuggestionsEl.classList.remove('hidden');
}

// Generate invoice HTML
function generateInvoice() {
    currentOrder.customerName = customerNameEl.value;
    currentOrder.customerPhone = customerPhoneEl.value;
    
    let itemsHtml = '';
    currentOrder.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>${item.name}</td>
                <td class="taka">${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td class="taka">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    });
    
    const invoiceHtml = `
        <div class="invoice">
            <div class="invoice-header">
                <h2>Rahik Cafe</h2>
                <p>17 RN Road, Jessore | Phone: 01931175603</p>
                <h3>TAX INVOICE</h3>
            </div>
            <div class="invoice-details">
                <div>
                    <p><strong>Invoice No:</strong> ${currentOrder.id}</p>
                    <p><strong>Date & Time:</strong> ${currentOrder.dateTime}</p>
                </div>
                <div>
                    <p><strong>Customer Name:</strong> ${currentOrder.customerName}</p>
                    <p><strong>Phone:</strong> ${currentOrder.customerPhone}</p>
                </div>
            </div>
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div class="invoice-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span class="taka">${currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Discount (${currentOrder.discount}%):</span>
                    <span class="taka">${currentOrder.discountAmount.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Total Amount:</span>
                    <span class="taka">${currentOrder.total.toFixed(2)}</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <p>Thank you for dining with us!</p>
                <p>Please visit again</p>
            </div>
        </div>
    `;
    
    return invoiceHtml;
}

// Export to Excel
function exportToExcel() {
    // Create a worksheet with all orders
    let csvContent = "Invoice No,Date Time,Customer Name,Phone,Subtotal,Discount,Total\n";
    
    orders.forEach(order => {
        csvContent += `"${order.id}","${order.dateTime}","${order.customerName}","${order.customerPhone}",${order.subtotal},${order.discount},${order.total}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rahik_cafe_orders_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Search orders
function searchOrders() {
    const term = searchTermEl.value.toLowerCase();
    if (!term) return;
    
    const results = orders.filter(order => 
        order.id.toLowerCase().includes(term) || 
        order.customerName.toLowerCase().includes(term) || 
        order.customerPhone.includes(term)
    );
    
    searchResultsEl.innerHTML = '';
    
    if (results.length === 0) {
        searchResultsEl.innerHTML = '<div class="search-item">No orders found</div>';
    } else {
        results.forEach(order => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `
                <p><strong>${order.id}</strong> - ${order.customerName}</p>
                <p>${order.dateTime} - Total: ৳${order.total.toFixed(2)}</p>
            `;
            div.addEventListener('click', () => {
                // Load the order details
                currentOrder = JSON.parse(JSON.stringify(order));
                initForm();
                renderOrderItems();
                searchResultsEl.classList.add('hidden');
            });
            searchResultsEl.appendChild(div);
        });
    }
    
    searchResultsEl.classList.remove('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initForm();
    
    // Add taka symbol to all elements with class 'taka'
    document.querySelectorAll('.taka').forEach(el => {
        const value = el.textContent || el.value;
        if (value && !value.startsWith('৳')) {
            el.textContent = '৳' + value;
        }
    });
});

addItemBtn.addEventListener('click', () => {
    const searchTerm = itemSearchEl.value.toLowerCase();
    const foundItem = menuItems.find(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.id.toString() === searchTerm
    );
    
    if (foundItem) {
        // Check if item already exists in order
        const existingItem = currentOrder.items.find(item => item.id === foundItem.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentOrder.items.push({
                id: foundItem.id,
                name: foundItem.name,
                price: foundItem.price,
                quantity: 1
            });
        }
        renderOrderItems();
        updateOrderSummary();
        itemSearchEl.value = '';
        itemSuggestionsEl.classList.add('hidden');
    } else {
        alert('Item not found!');
    }
});

clearOrderBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the current order?')) {
        currentOrder = {
            id: generateInvoiceNo(),
            dateTime: getCurrentDateTime(),
            customerName: "",
            customerPhone: "",
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0
        };
        customerNameEl.value = "";
        customerPhoneEl.value = "";
        initForm();
        renderOrderItems();
    }
});

discountEl.addEventListener('input', updateOrderSummary);

searchBtn.addEventListener('click', searchOrders);

generateBillBtn.addEventListener('click', () => {
    if (currentOrder.items.length === 0) {
        alert('Please add items to the order first!');
        return;
    }
    
    if (!customerNameEl.value) {
        alert('Please enter customer name!');
        return;
    }
    
    // Save the order
    currentOrder.customerName = customerNameEl.value;
    currentOrder.customerPhone = customerPhoneEl.value;
    orders.push(JSON.parse(JSON.stringify(currentOrder)));
    localStorage.setItem('rahikCafeOrders', JSON.stringify(orders));
    
    // Generate and show invoice
    invoiceContentEl.innerHTML = generateInvoice();
    invoicePreviewEl.classList.remove('hidden');
    
    // Create a new order
    currentOrder = {
        id: generateInvoiceNo(),
        dateTime: getCurrentDateTime(),
        customerName: "",
        customerPhone: "",
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0
    };
    customerNameEl.value = "";
    customerPhoneEl.value = "";
    initForm();
    renderOrderItems();
});

printBillBtn.addEventListener('click', () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice ${currentOrder.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .invoice { max-width: 500px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
                    .invoice-header { text-align: center; margin-bottom: 20px; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    .invoice-totals { margin-left: auto; width: 300px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                    .total-row:last-child { border-bottom: none; font-weight: bold; }
                    .taka::before { content: "৳"; margin-right: 2px; }
                </style>
            </head>
            <body>
                ${generateInvoice()}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
});

exportExcelBtn.addEventListener('click', exportToExcel);

itemSearchEl.addEventListener('input', () => {
    showItemSuggestions(itemSearchEl.value);
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== itemSearchEl) {
        itemSuggestionsEl.classList.add('hidden');
    }
});