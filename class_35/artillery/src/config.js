/**
 * Archivo central de configuración
 * Toma opciones desde línea de comandos y variables de entorno
 * 
 * Para las variables de entorno puede usarse dotenv o cargarlas
 * automáticamente con el soporte nativo de Node (desde v.20.6.x)
 * usando node --env-file archivo_env src/app
 */

import path from 'path';
// import dotenv from 'dotenv';
import { Command } from 'commander';

// dotenv.config();
// dotenv.config({ path: 'ruta_archivo_.env'});

const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
commandLine.parse();
const clOptions = commandLine.opts();

const config = {
    APP_NAME: 'coder_53120',
    SERVER: 'atlas_17',
    PORT: clOptions.port || 5000,
    // Linux / Mac
    // DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    // Win
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')),
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img` },
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
    SECRET: process.env.SECRET,
    PRODUCTS_PER_PAGE: 5,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
}

export default config;
