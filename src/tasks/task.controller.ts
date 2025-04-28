// src/tasks/task.controller.ts (LENGKAP)

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus, Task } from './task.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';

// Definisikan interface payload (atau impor jika ada di tempat lain)
interface UserPayload {
  userId: number;
  email: string;
  name: string;
}

@ApiTags('Tasks') // Tag untuk Swagger
@ApiBearerAuth('bearer') // Menandakan semua endpoint di sini butuh Bearer token
@Controller('tasks') // Prefix route /api/tasks
// Guard sudah global, tidak perlu @UseGuards di sini
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {} // Inject service

  // --- Endpoint untuk Membuat Task Baru ---
  @Post() // Method POST ke /api/tasks
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto }) // Deskripsikan body request
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createTaskDto: CreateTaskDto, // Ambil data dari body, validasi otomatis
    @Req() request: Request, // Inject object Request
  ): Promise<Task> {
    const userPayload = request['user'] as UserPayload; // Ambil user dari request (ditempel Guard)
    if (!userPayload || !userPayload.userId)
      throw new Error('User information missing from request.'); // Pengaman
    this.logger.debug(
      `User ID ${userPayload.userId} creating task: ${createTaskDto.title}`,
    );
    return this.tasksService.createTask(createTaskDto, userPayload.userId);
  }

  // --- Endpoint untuk Mengambil Semua Task (dengan filter/sort opsional) ---
  @Get() // Method GET ke /api/tasks
  @ApiOperation({
    summary: 'Get all tasks for the user (with optional filtering/sorting)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filter tasks by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for title/description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'deadline'],
    description: 'Field to sort by (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks retrieved successfully.',
    type: [Task],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Req() request: Request,
    @Query('status') status?: TaskStatus,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'deadline',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ): Promise<Task[]> {
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User information missing from request.');
    return this.tasksService.findAll(
      userPayload.userId,
      status,
      search,
      sortBy,
      sortOrder?.toUpperCase() as 'ASC' | 'DESC',
    );
  }

  // --- Endpoint untuk Mengambil Ringkasan Task ---
  @Get('summary') // Method GET ke /api/tasks/summary
  @ApiOperation({ summary: 'Get task summary counts for the user' })
  @ApiResponse({
    status: 200,
    description: 'Task summary retrieved',
    schema: { example: { completed: 1, pending: 5, nearDeadline: 2 } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary(
    @Req() request: Request,
  ): Promise<{ completed: number; pending: number; nearDeadline: number }> {
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User information missing from request.');
    return this.tasksService.getSummary(userPayload.userId);
  }

  // --- Endpoint untuk Mengambil Satu Task Berdasarkan ID ---
  @Get(':id') // Method GET ke /api/tasks/:id
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the task to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Task details.', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(
    @Param('id', ParseIntPipe) id: number, // Ambil 'id' dari path, validasi & konversi ke number
    @Req() request: Request,
  ): Promise<Task> {
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User information missing from request.');
    return this.tasksService.findOne(id, userPayload.userId);
  }

  // --- Endpoint untuk Mengupdate Task Berdasarkan ID ---
  @Put(':id') // Method PUT ke /api/tasks/:id
  @ApiOperation({ summary: 'Update a specific task' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the task to update',
  })
  @ApiBody({ type: UpdateTaskDto }) // Deskripsikan body request
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto, // Ambil data dari body, validasi otomatis
    @Req() request: Request,
  ): Promise<Task> {
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User information missing from request.');
    return this.tasksService.updateTask(id, updateTaskDto, userPayload.userId);
  }

  // --- Endpoint untuk Menghapus Task Berdasarkan ID ---
  @Delete(':id') // Method DELETE ke /api/tasks/:id
  @ApiOperation({ summary: 'Delete a specific task' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the task to delete',
  })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.' }) // Atau bisa 204 No Content
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<void> {
    // Biasanya tidak mengembalikan apa-apa (void)
    const userPayload = request['user'] as UserPayload;
    if (!userPayload || !userPayload.userId)
      throw new Error('User information missing from request.');
    return this.tasksService.removeTask(id, userPayload.userId);
  }
} // <-- Akhir dari class TasksController
