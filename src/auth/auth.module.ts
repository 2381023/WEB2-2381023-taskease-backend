// src/auth/auth.module.ts (Perbaikan Impor & Provider)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
// HAPUS --> import { PassportModule } from '@nestjs/passport'; // Tidak perlu lagi
import { UsersModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// HAPUS --> import { JwtStrategy } from './jwt.strategy'; // Tidak perlu lagi

@Module({
  imports: [
    UsersModule,
    // HAPUS --> PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      // JwtModule masih dibutuhkan untuk sign dan verify
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_EXPIRATION_TIME') || '3600s',
        },
      }),
    }),
    ConfigModule,
  ],
  // HAPUS JwtStrategy dari providers
  providers: [AuthService], // Hanya AuthService yang perlu disediakan oleh modul ini
  controllers: [AuthController],
  // HAPUS PassportModule dari exports
  exports: [AuthService, JwtModule], // Ekspor JwtModule jika AuthGuard butuh JwtService (sudah di-provide NestJS secara otomatis jika JwtModule diimpor)
  // Atau bisa juga hapus JwtModule dari export jika tidak ada module lain yg import AuthModule untuk pakai JwtModule
})
export class AuthModule {}
