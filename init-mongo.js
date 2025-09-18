// MongoDB initialization script for StarkPay
db = db.getSiblingDB('starkpay');

// Create collections
db.createCollection('merchants');
db.createCollection('transactions');
db.createCollection('payments');

// Create indexes for better performance
db.merchants.createIndex({ "address": 1 }, { unique: true });
db.merchants.createIndex({ "email": 1 }, { sparse: true });
db.merchants.createIndex({ "isActive": 1 });

db.transactions.createIndex({ "transactionHash": 1 }, { unique: true });
db.transactions.createIndex({ "merchantAddress": 1 });
db.transactions.createIndex({ "payerAddress": 1 });
db.transactions.createIndex({ "status": 1 });
db.transactions.createIndex({ "timestamp": -1 });
db.transactions.createIndex({ "blockNumber": 1 });

db.payments.createIndex({ "paymentId": 1 }, { unique: true });
db.payments.createIndex({ "merchantAddress": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "createdAt": -1 });
db.payments.createIndex({ "expiresAt": 1 });

print('StarkPay database initialized successfully!');