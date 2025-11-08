import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './config/dbConnect.js';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import cloudinaryConnect from './config/cloudinary.js';

dotenv.config();

const app = express();
dbConnect();
cloudinaryConnect();
app.use(express.json());

// ---------- CORS ----------
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || '*',
  credentials: true
}));

// ---------- API ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);

// ---------- Health Check ----------
app.get('/health', (req, res) => {
  res.send('API is running...');
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

