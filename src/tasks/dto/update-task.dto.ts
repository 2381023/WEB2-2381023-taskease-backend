// src/tasks/dto/update-task.dto.ts (Tambahkan categoryId Opsional)
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsInt, // <-- Impor IsInt
  Min, // <-- Impor Min
} from 'class-validator';
import { TaskStatus } from '../task.entity';
import { ApiPropertyOptional } from '@nestjs/swagger'; // <-- Impor ApiPropertyOptional

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated Task Title' }) // <-- Tambah ApiPropertyOptional
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'New updated description.' }) // <-- Tambah ApiPropertyOptional
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ example: '2025-07-01T10:00:00Z' }) // <-- Tambah ApiPropertyOptional
  @IsDateString(
    {},
    { message: 'Deadline must be a valid ISO 8601 date string.' },
  )
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.Done }) // <-- Tambah ApiPropertyOptional
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: ToDo, InProgress, Done',
  })
  @IsOptional()
  status?: TaskStatus;

  // --- TAMBAHKAN PROPERTI INI ---
  @ApiPropertyOptional({
    example: 2,
    description: 'Optional ID of the category to associate the task with',
    type: Number,
    nullable: true,
  }) // <-- Tambah ApiPropertyOptional
  @IsInt({ message: 'Category ID must be an integer number.' })
  @Min(1, { message: 'Category ID must be a positive number.' })
  @IsOptional()
  categoryId?: number | null; // <-- Tambahkan properti categoryId
  // --- AKHIR TAMBAHAN ---
}
