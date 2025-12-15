import cors from 'cors';

/**
 * CORS configuration
 * Allows frontend to communicate with backend
 */
export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173', // Vite dev
            'http://localhost:3000', // Alternative dev port
            'https://econeura-109cc.web.app', // Firebase Hosting (Prod)
            'https://econeura-109cc.firebaseapp.com' // Firebase Hosting (Alternate)
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
