import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ensure TypeOrmModule is imported
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { User } from './user.entity'; // Ensure the User entity is imported

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Ensure User entity is registered here
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Ensure UsersService is exported for AuthModule
})
export class UsersModule {}
