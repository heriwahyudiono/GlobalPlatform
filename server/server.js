const express = require('express');
const app = express();
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/payments', paymentRoutes); // akses: /api/payments/create-transaction

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
