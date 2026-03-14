const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/process-payment',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const testPayment = () => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(JSON.stringify({
            cardNumber: '1234567812345678',
            expiry: '12/25',
            cvv: '123',
            amount: '100.00'
        }));
        req.end();
    });
};

testPayment().then(res => {
    console.log('Payment Test Result:', res);
    if (res.status === 200 && res.body.success) {
        console.log('✅ Payment API is working!');
    } else {
        console.log('❌ Payment API failed!');
    }
}).catch(console.error);
