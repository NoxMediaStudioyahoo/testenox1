import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
    // Load env file based on mode
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        plugins: [react()],
        server: {
            port: parseInt(process.env.PORT || '5173'),
            strictPort: true,
            host: true, // Needed for docker/render.com
            // Allow all origins in development
            cors: true,
            // Configure allowed hosts
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            hmr: {
                // Fall back to ws:// when in production
                protocol: 'ws',
                // Support render.com and localhost
                host: process.env.VITE_HMR_HOST || 'localhost',
                port: parseInt(process.env.PORT || '5173'),
            }
        },
        preview: {
            port: parseInt(process.env.PORT || '5173'),
            strictPort: true,
            host: true,
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }
    }
});
