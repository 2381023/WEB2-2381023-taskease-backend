// src/app.module.ts (BENAR - Gaya Referensi dengan Global Guard)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; // Pastikan AuthModule diimpor
import { UsersModule } from './users/user.module';
import { TasksModule } from './tasks/task.module';
import { DataSourceOptions } from 'typeorm';
import { User } from './users/user.entity'; // Impor entity
import { Task } from './tasks/task.entity'; // Impor entity
import { APP_GUARD } from '@nestjs/core'; // <-- Impor APP_GUARD
import { AuthGuard } from './auth/auth.guard'; // <-- Impor AuthGuard kustom

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // useFactory HARUS berisi logika untuk membaca .env dan mengembalikan DataSourceOptions
      useFactory: (configService: ConfigService): DataSourceOptions => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const host = configService.get<string>('POSTGRES_HOST');
        const port = configService.get<number>('POSTGRES_PORT');
        const username = configService.get<string>('POSTGRES_USER');
        const password = configService.get<string>('POSTGRES_PASSWORD');
        const database = configService.get<string>('POSTGRES_DATABASE');

        if (!host || !port || !username || !password || !database) {
          throw new Error(
            'FATAL ERROR: Missing Database Environment Variables in AppModule configuration.',
          );
        }

        // Kembalikan konfigurasi koneksi database yang valid
        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          // Tetap gunakan entities eksplisit karena ini yang berhasil untuk Anda sebelumnya
          entities: [User, Task],
          synchronize: false,
          logging: !isProduction,
          ssl: { rejectUnauthorized: false },
        };
      },
      // TIDAK pakai autoLoadEntities jika pakai 'entities' di factory
    }),
    AuthModule, // AuthModule tetap dibutuhkan untuk JwtService dll.
    UsersModule,
    TasksModule,
  ],
  controllers: [], // Hapus AppController jika tidak dipakai
  providers: [
    // Daftarkan AuthGuard sebagai global guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Gunakan AuthGuard kustom Anda
    },
    // AppService tidak perlu jika AppController dihapus
    // JwtService & ConfigService disediakan oleh AuthModule & ConfigModule global
  ],
})
export class AppModule {}
