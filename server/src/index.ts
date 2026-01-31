
/**
 * =========================================================
 * 🚀 DIAFAT KHULUD - PROFESSIONAL BACKEND SERVER
 * =========================================================
 * Clean Architecture Refactor
 * =========================================================
 */

import express, { Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

// Config
import { uploadConfig } from './config/multer';

// Routes
import authRoutes from './routes/auth';
import bookingsRoutes from './routes/bookings';
import paymentRoutes from './routes/payment';
import aiRoutes from './routes/ai';
import adminRoutes from './routes/admin';
import contactRoutes from './routes/contact';
import couponRoutes from './routes/coupons';
import notificationRoutes from './routes/notifications';
import hotelsRoutes from './routes/hotels';
import roomRoutes from './routes/rooms';

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'https://diaftkhulud.com',
    'https://www.diaftkhulud.com'
];

// Allow adding origins via env var (comma separated)
if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

// 🔍 DEBUG LOGGING
app.use((req: any, res: any, next: any) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// ✅ HEALTH CHECK (No DB dependency)
app.get('/api/health', (req: any, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        db: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
});

// 🛣️ API ROUTES (Must be BEFORE static files)
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/rooms', roomRoutes);

// 📂 STATIC FILES
// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../../dist')));
// Serve Public Uploads (Robust Path)
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
// Fallback for other public files
app.use(express.static(path.join(__dirname, '../../public')));

// 📤 UPLOAD ROUTE (Kept simple here or can be moved to dedicated route)
app.post('/api/upload', uploadConfig.single('image'), (req: any, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return relative URL
    // We need to reconstruct the relative path logic similar to before or simplify it.
    // The previous logic generated the URL based on where it saved customly.
    // Since we used logic in multer config, we can just grab the relative path from the saved file.

    // Simplest way: /uploads/...
    // But we need to know the subfolders.
    // The file.path is absolute. 
    // We can slice from 'public/uploads'.
    const absolutePath = req.file.path;
    const relativePath = absolutePath.split('uploads')[1].replace(/\\/g, '/');
    const fullUrl = `/uploads${relativePath}`;

    res.json({ url: fullUrl, success: true });
});

// 🌐 Client-Side Routing (Catch-All)
// Must be after all API routes
app.get('*', (req: any, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// START SERVER
app.listen(PORT, () => {
    console.log(`
    🚀 Server running on http://localhost:${PORT}
    🗄️  Database: MySQL (Configured via Prisma)
    ✅ Mode: Professional Refactored
    `);
});
