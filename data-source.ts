import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();
const configService = new ConfigService();

const isProduction = configService.get<string>('NODE_ENV') === 'production';

const host = configService.get<string>('POSTGRES_HOST');
const port = configService.get<number>('POSTGRES_PORT');
const username = configService.get<string>('POSTGRES_USER');
const password = configService.get<string>('POSTGRES_PASSWORD');
const database = configService.get<string>('POSTGRES_DATABASE');

if (!host || !port || !username || !password || !database) {
  console.error(
    'FATAL ERROR: Missing Database Environment Variables (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE).',
  );
  process.exit(1);
}

const options: DataSourceOptions = {
  type: 'postgres',
  host: host,
  port: port,
  username: username,
  password: password,
  database: database,
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Path entities sudah benar jika entity ada di subfolder src
  // --- PERBAIKI BARIS INI ---
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'], // <-- Tambahkan '/src'
  // --- AKHIR PERBAIKAN ---
  synchronize: false,
  logging: !isProduction,
  ssl: { rejectUnauthorized: false },
};

export default new DataSource(options);
