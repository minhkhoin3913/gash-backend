const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/Accounts');
const productsRoutes = require('./routes/Products');
const categoriesRoutes = require('./routes/Categories');
const ordersRoutes = require('./routes/Orders');
const orderDetailsRoutes = require('./routes/OrderDetails');
const cartsRoutes = require('./routes/Carts');
const favoritesRoutes = require('./routes/Favorites');
const importBillRoutes = require('./routes/ImportBill');
const importBillDetailsRoutes = require('./routes/ImportBillDetails');
const warehousesRoutes = require('./routes/Warehouses');
const productImagesRoutes = require('./routes/ProductImages');
const productColorsRoutes = require('./routes/ProductColors');
const productVariantsRoutes = require('./routes/ProductVariants');
const productSizesRoutes = require('./routes/ProductSizes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/orderdetails', orderDetailsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/importbills', importBillRoutes);
app.use('/api/importbilldetails', importBillDetailsRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/productimages', productImagesRoutes);
app.use('/api/productcolors', productColorsRoutes);
app.use('/api/productvariants', productVariantsRoutes);
app.use('/api/productsizes', productSizesRoutes);

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