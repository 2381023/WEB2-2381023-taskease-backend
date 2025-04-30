// src/categories/categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Category } from './category.entity'; // Impor entity untuk tipe response

// Definisikan tipe payload user dari guard global
interface UserPayload {
  userId: number;
  email: string;
  name: string;
}

@ApiTags('Categories')
@ApiBearerAuth('bearer') // Semua endpoint di sini memerlukan otentikasi
@Controller('categories') // Prefix route /api/categories
// Guard sudah global, tidak perlu @UseGuards di sini
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() request: Request,
  ): Promise<Category> {
    const user = request['user'] as UserPayload;
    this.logger.log(
      `User ${user.userId} creating category: ${createCategoryDto.name}`,
    );
    return this.categoriesService.create(createCategoryDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of categories.',
    type: [Category],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() request: Request): Promise<Category[]> {
    const user = request['user'] as UserPayload;
    return this.categoriesService.findAllByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the category' })
  @ApiResponse({
    status: 200,
    description: 'Category details.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<Category> {
    const user = request['user'] as UserPayload;
    return this.categoriesService.findOneByUser(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to update',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() request: Request,
  ): Promise<Category> {
    const user = request['user'] as UserPayload;
    return this.categoriesService.update(id, updateCategoryDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to delete',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' }) // Atau 204
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<void> {
    const user = request['user'] as UserPayload;
    return this.categoriesService.remove(id, user.userId);
  }
}
