import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    example: 'Need to discuss the new design mockups.',
    description: 'Content of the note',
  })
  @IsString()
  @IsNotEmpty({ message: 'Note content should not be empty.' })
  content: string;
}
