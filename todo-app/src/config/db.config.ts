import { registerAs } from "@nestjs/config";

export default registerAs('db', () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',

    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    synchronise: process.env.NODE_ENV === 'development',
}));