import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function verifyStockReduction() {
    try {
        console.log('--- Starting Stock Reduction Verification ---');

        // 1. Always Clean & Seed for reliable test
        console.log('Resetting DB for Verification...');
        // We can't easily delete *everything* via public API unless we add a route or use the seed route which deletes all.
        // utilization of seed route:
        const seedItems = [{
            id: 999,
            name: "Test Stock Burger",
            price: 100,
            stock: 10,
            category: "Verification",
            dietary: "Veg",
            image: "https://via.placeholder.com/150",
            description: "Temporary item for verification"
        }];

        await fetch(`${API_URL}/items/seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seedItems)
        });

        const itemsRes = await fetch(`${API_URL}/items`);
        const items = await itemsRes.json();

        const targetItem = items[0];
        console.log(`Target Item: ${targetItem.name} (ID: ${targetItem.id})`);
        console.log(`Initial Stock: ${targetItem.stock}`);

        if (targetItem.stock < 1) {
            console.error('Initial stock is too low for test.');
            return;
        }

        // 2. Place Order
        const orderQty = 1;
        const orderPayload = {
            userId: 'test_verifier',
            items: [{ ...targetItem, qty: orderQty }],
            total: targetItem.price * orderQty,
            paymentMethod: 'Cash'
        };

        console.log(`Placing order for ${orderQty} ${targetItem.name}...`);
        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        const orderData = await orderRes.json();

        if (orderData.success) {
            console.log('Order Placed Successfully!');
        } else {
            console.error('Order Failed:', orderData.message);
            return;
        }

        // 3. Verify Stock Reduction
        const verifyRes = await fetch(`${API_URL}/items`);
        const verifyItems = await verifyRes.json();
        const verifiedItem = verifyItems.find(i => i.id === targetItem.id);

        console.log(`Verified Stock: ${verifiedItem.stock}`);

        if (verifiedItem.stock === targetItem.stock - orderQty) {
            console.log('✅ Stock Reduction Verified Successfully!');
        } else {
            console.error('❌ Stock Reduction Failed!');
            console.error(`Expected: ${targetItem.stock - orderQty}, Found: ${verifiedItem.stock}`);
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verifyStockReduction();
