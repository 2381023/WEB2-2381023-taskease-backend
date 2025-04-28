import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { TaskStatus } from '../task.entity'; // Import enum

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title should not be empty.' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString(
    {},
    {
      message:
        'Deadline must be a valid ISO 8601 date string (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)',
    },
  )
  @IsNotEmpty({ message: 'Deadline should not be empty.' })
  deadline: string; // Receive as string, convert in service/entity

  @IsEnum(TaskStatus, {
    message: 'Status must be one of: ToDo, InProgress, Done',
  })
  @IsOptional() // Frontend might not send it, default is in entity
  status?: TaskStatus;
}
