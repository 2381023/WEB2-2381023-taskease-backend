// src/tasks/dto/create-task.dto.ts (Dimodifikasi - Tambah categoryId Opsional)
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt, // <-- Impor IsInt
  Min, // <-- Impor Min
} from 'class-validator';
import { TaskStatus } from '../task.entity'; // Import enum
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // <-- Impor ApiProperty & ApiPropertyOptional

export class CreateTaskDto {
  @ApiProperty({
    example: 'Submit Final Report',
    description: 'Title of the task',
    required: true,
  }) // <-- Tambah ApiProperty
  @IsString()
  @IsNotEmpty({ message: 'Title should not be empty.' })
  title: string;

  @ApiPropertyOptional({
    example: 'Include appendix and references.',
    description: 'Optional description',
  }) // <-- Tambah ApiPropertyOptional
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2025-06-01T17:00:00.000Z',
    description: 'Deadline in ISO 8601 format',
    required: true,
  }) // <-- Tambah ApiProperty
  @IsDateString(
    {},
    {
      message:
        'Deadline must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)',
    },
  )
  @IsNotEmpty({ message: 'Deadline should not be empty.' })
  deadline: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.ToDo,
    description: 'Initial status (default: ToDo)',
    default: TaskStatus.ToDo,
  }) // <-- Tambah ApiPropertyOptional
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: ToDo, InProgress, Done',
  })
  @IsOptional()
  status?: TaskStatus;

  // --- TAMBAHAN BARU ---
  @ApiPropertyOptional({
    example: 1,
    description: 'Optional ID of the category this task belongs to',
    type: Number,
  }) // <-- Tambah ApiPropertyOptional
  @IsInt({ message: 'Category ID must be an integer number.' }) // Validasi tipe integer
  @Min(1, { message: 'Category ID must be a positive number.' }) // Validasi minimal 1 (opsional, tapi baik)
  @IsOptional() // <-- Tandai sebagai Opsional
  categoryId?: number | null; // Tipe bisa number atau null/undefined
  // --- AKHIR TAMBAHAN BARU ---
}
