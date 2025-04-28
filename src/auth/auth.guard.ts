// src/auth/auth.guard.ts (Perbaikan verifyAsync)
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Definisikan interface untuk payload yang diharapkan
interface UserPayload {
  sub: number; // Pastikan 'sub' ada di token Anda
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestUrl = request.url;
    this.logger.debug(`AuthGuard processing request for: ${requestUrl}`);

    const publicPaths = ['/api/auth/login', '/api/auth/register'];

    if (publicPaths.includes(requestUrl)) {
      this.logger.debug(`Allowing public access to: ${requestUrl}`);
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn(`No token found for protected route: ${requestUrl}`);
      throw new UnauthorizedException('No authentication token provided.');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        this.logger.error('JWT_SECRET is not configured!');
        throw new UnauthorizedException('Internal server configuration error.');
      }

      // --- PERBAIKAN DI SINI ---
      // Verifikasi token. Kita bisa menggunakan 'any' atau UserPayload jika kita yakin strukturnya cocok.
      // verifyAsync akan melempar error jika signature/expiration tidak valid.
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: secret,
      });
      // --- AKHIR PERBAIKAN ---

      // Verifikasi payload dasar (pastikan ada 'sub')
      if (!payload || typeof payload.sub !== 'number') {
        this.logger.warn(
          `Invalid payload structure after verification: ${JSON.stringify(payload)}`,
        );
        throw new UnauthorizedException('Invalid token payload structure.');
      }

      // Tempelkan payload yang relevan ke request
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      };

      this.logger.debug(
        `Token verified successfully for user ID: ${payload.sub}. Attaching user to request.`,
      );
    } catch (error) {
      this.logger.warn(`Token verification failed: ${error.message}`);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired.');
      } else if (error instanceof UnauthorizedException) {
        // Re-throw UnauthorizedException yang mungkin dilempar dari pengecekan payload di atas
        throw error;
      }
      // Untuk error verifikasi lainnya (misalnya signature salah)
      throw new UnauthorizedException('Invalid token.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
