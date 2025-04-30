import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Personal Errands',
    description: 'New name for the category',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Category name should not be empty.' })
  @MaxLength(100)
  @IsOptional() // Memungkinkan update parsial
  name?: string;
}
