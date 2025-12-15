/**
 * Structured logger for production
 * Optimized for Google Cloud Logging (Stackdriver)

 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

class Logger {
    private log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            metadata
        };

        // In production, this would send to Application Insights
        // For now, structured console logging
        if (process.env.NODE_ENV === 'production') {
            // Use stdout for production logging (captured by App Service)
            process.stdout.write(JSON.stringify(entry) + '\n');
        } else {
            // Pretty print in development

            console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, metadata || '');
        }
    }

    info(message: string, metadata?: Record<string, unknown>) {
        this.log('info', message, metadata);
    }

    warn(message: string, metadata?: Record<string, unknown>) {
        this.log('warn', message, metadata);
    }

    error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>) {
        this.log('error', message, {
            ...metadata,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });
    }

    debug(message: string, metadata?: Record<string, unknown>) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, metadata);
        }
    }
}

export const logger = new Logger();
