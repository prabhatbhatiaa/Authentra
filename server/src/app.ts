import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health / Status Check Endpoint with DB probe
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('./config/db.js');
    const [userCount, orgCount, assetCount] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.asset.count(),
    ]);

    res.status(200).json({
      status: 'healthy',
      service: 'Authentra API Engine',
      version: '1.0.0',
      environment: config.env,
      database: {
        connected: true,
        provider: 'PostgreSQL (Neon)',
        counts: {
          organizations: orgCount,
          users: userCount,
          assets: assetCount,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (dbErr: any) {
    res.status(503).json({
      status: 'degraded',
      service: 'Authentra API Engine',
      database: {
        connected: false,
        error: dbErr.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Centralized 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    },
  });
});

// Centralized Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.env === 'production' ? 'An internal error occurred.' : err.message,
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`[Authentra API] Server running in ${config.env} mode on port ${config.port}`);
    console.log(`[Authentra API] Health check at http://localhost:${config.port}/api/health`);
  });
}

export default app;
