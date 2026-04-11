require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('./config/passport');
const path = require('path');

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

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no origin header) and configured origins
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5000',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
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

// Serve frontend static files
// const frontendPath = path.join(__dirname, '../../dist');
// app.use(express.static(frontendPath));

// app.get((req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });
const frontendPath = path.join(__dirname, '../../../dist');

app.use(express.static(frontendPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  res.sendFile(path.join(frontendPath, 'index.html'));
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
