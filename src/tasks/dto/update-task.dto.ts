import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  // Allow empty string for description update, but check if needed
  @IsOptional()
  description?: string | null; // Allow null to clear description?

  @IsDateString(
    {},
    { message: 'Deadline must be a valid ISO 8601 date string.' },
  )
  @IsOptional()
  deadline?: string;

  @IsEnum(TaskStatus, {
    message: 'Status must be one of: ToDo, InProgress, Done',
  })
  @IsOptional()
  status?: TaskStatus;
}
