const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const accountsRoutes = require('./routes/accountRoutes');
const productsRoutes = require('./routes/productRoutes');
const categoriesRoutes = require('./routes/categoryRoutes');
const ordersRoutes = require('./routes/orderRoutes');
const orderDetailsRoutes = require('./routes/orderDetailRoutes');
const cartsRoutes = require('./routes/cartRoutes');
const favoritesRoutes = require('./routes/favoriteRoutes');
// const importBillRoutes = require('./routes/ImportBill');
// const importBillDetailsRoutes = require('./routes/ImportBillDetails');
// const warehousesRoutes = require('./routes/Warehouses');
const productSpecRoutes = require('./routes/specRoutes');
const productVarRoutes = require('./routes/variantRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/accounts', accountsRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/orders', ordersRoutes);
app.use('/order-details', orderDetailsRoutes);
app.use('/carts', cartsRoutes);
app.use('/variants', productVarRoutes);
app.use('/favorites', favoritesRoutes);
// app.use('/importbills', importBillRoutes);
// app.use('/importbilldetails', importBillDetailsRoutes);
// app.use('/warehouses', warehousesRoutes);
app.use('/specifications', productSpecRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});