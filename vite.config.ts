import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const allowedHostsList = [
    'localhost',
    '127.0.0.1',
    'testenox1-7bya.onrender.com'
];

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
            allowedHosts: allowedHostsList,
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
            allowedHosts: allowedHostsList,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }
    }
});
