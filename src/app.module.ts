// src/app.module.ts (Lengkap dan Diperbaiki)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { TasksModule } from './tasks/task.module';
import { CategoriesModule } from './categories/categories.module';
import { NotesModule } from './notes/notes.module'; // <-- Impor NotesModule
import { DataSourceOptions } from 'typeorm';
import { User } from './users/user.entity';
import { Task } from './tasks/task.entity';
import { Category } from './categories/category.entity';
import { Note } from './notes/note.entity'; // <-- Impor Note entity
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        // --- Pastikan semua definisi variabel ada di sini ---
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production'; // Definisi isProduction
        const host = configService.get<string>('POSTGRES_HOST');
        const port = configService.get<number>('POSTGRES_PORT');
        const username = configService.get<string>('POSTGRES_USER');
        const password = configService.get<string>('POSTGRES_PASSWORD');
        const database = configService.get<string>('POSTGRES_DATABASE'); // Definisi database
        // --- Akhir definisi variabel ---

        // Pengecekan variabel tetap ada
        if (!host || !port || !username || !password || !database) {
          throw new Error(
            'FATAL ERROR: Missing Database Environment Variables in AppModule configuration.',
          );
        }

        // Objek DataSourceOptions yang dikembalikan
        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database, // Gunakan variabel database
          entities: [User, Task, Category, Note], // Daftarkan semua entity
          synchronize: false, // Gunakan migrasi
          logging: !isProduction, // Gunakan variabel isProduction
          ssl: { rejectUnauthorized: false }, // Konfigurasi SSL
        };
      },
      // autoLoadEntities tidak dipakai karena entities didaftarkan di factory
    }),
    // Impor semua modul fitur
    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    NotesModule,
  ],
  controllers: [], // Tidak ada AppController
  providers: [
    // Daftarkan AuthGuard sebagai global guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Tidak ada AppService
  ],
})
export class AppModule {}
