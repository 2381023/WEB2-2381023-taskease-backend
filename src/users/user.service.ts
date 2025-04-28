import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  // Method needed by AuthService to get password for comparison
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password_hash'], // Explicitly select password
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      // Catch potential unique constraint errors (e.g., duplicate email)
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        throw new ConflictException('Email already exists');
      }
      throw error; // Re-throw other errors
    }
  }

  async getProfile(userId: number): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'], // Exclude password
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findById(userId); // Get user without password first
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { name, email, password } = updateUserDto;
    let needsUpdate = false;

    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: email, id: Not(userId) },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use by another account');
      }
      user.email = email;
      needsUpdate = true;
    }

    if (name && name !== user.name) {
      user.name = name;
      needsUpdate = true;
    }

    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
      needsUpdate = true;
    }

    if (!needsUpdate && !password) {
      // Check if password changed even if other fields didn't
      // If nothing changed, just return the current profile data
      const { password_hash, ...result } = user; // Need password hash locally here to exclude
      return result;
    }

    try {
      // Save the user object (TypeORM handles update based on existing ID)
      const updatedUser = await this.userRepository.save(user);
      const { password_hash, ...result } = updatedUser; // Exclude password from response
      return result;
    } catch (error) {
      // Catch potential unique constraint errors if email was changed concurrently
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      console.error('Error updating profile:', error);
      throw new BadRequestException('Could not update profile');
    }
  }
}
