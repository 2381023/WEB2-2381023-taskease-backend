import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({
    example: 'Meeting scheduled for tomorrow.',
    description: 'Updated content of the note',
    required: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Note content should not be empty.' })
  @IsOptional() // Memungkinkan update parsial
  content?: string;
}
