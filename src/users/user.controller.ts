// src/users/user.controller.ts (Perbaikan)
import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'; // Hapus UseGuards, GetUser. Tambah Req, Logger
import { UsersService } from './user.service';
// HAPUS --> import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
// HAPUS --> import { GetUser } from '../auth/decorators/get-user.decorator';
import { Request } from 'express'; // Impor Request
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'; // Impor Swagger

// Definisikan tipe data yang diharapkan ada di request['user']
interface UserPayload {
  userId: number;
  email: string;
  name: string;
}

@ApiTags('Users')
@ApiBearerAuth('bearer') // Tetap diperlukan untuk Swagger
@Controller('users')
// HAPUS --> @UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  // ... (ApiResponse decorators)
  async getProfile(@Req() request: Request) {
    // Inject Request
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User not found on request');
    this.logger.log(
      `GET /users/me - User from request: ${JSON.stringify(userPayload)}`,
    );
    return this.usersService.getProfile(userPayload.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  // ... (ApiResponse decorators)
  // @UsePipes(new ValidationPipe({...})) // Bisa terapkan pipe di sini jika belum global
  async updateProfile(
    @Req() request: Request, // Inject Request
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User not found on request');
    this.logger.log(
      `PUT /users/me - User from request: ${JSON.stringify(userPayload)}`,
    );
    return this.usersService.updateProfile(userPayload.userId, updateUserDto);
  }
}
