require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('./config/passport');

// Route imports
const authRoutes = require('./routes/authRoutes');
const repoRoutes = require('./routes/repoRoutes');
const scanRoutes = require('./routes/scanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const billingRoutes = require('./routes/billingRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Security Middlewares
app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Stripe Webhooks (must be before express.json parsing)
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRoutes.webhookRouter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

const userRoutes = require('./routes/userRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/history', reviewRoutes);
app.use('/api/report', reviewRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/billing', billingRoutes.router); // all other billing routes
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;

// Connect to DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to DB on startup:", err);
  // Continue without DB for pure mock testing if needed
  if (!process.env.MONGO_URI) {
    console.log("Starting server without DB (Mock mode only)");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
});
