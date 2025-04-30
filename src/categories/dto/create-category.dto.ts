import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Work Project',
    description: 'Name of the category',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Category name should not be empty.' })
  @MaxLength(100)
  name: string;
}
