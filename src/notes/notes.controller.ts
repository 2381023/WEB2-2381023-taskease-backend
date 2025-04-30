// src/notes/notes.controller.ts
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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Note } from './note.entity';

// Definisikan tipe payload user dari guard global
interface UserPayload {
  userId: number;
  email: string;
  name: string;
}

// Catatan: Endpoint untuk notes mungkin lebih logis berada di bawah /tasks/{taskId}/notes
// Tapi untuk CRUD terpisah, kita buat di /notes (dengan pengecekan akses task di service)
// Alternatif lain: buat sebagian di TasksController, sebagian di NotesController

@ApiTags('Notes') // Tag Swagger
@ApiBearerAuth('bearer') // Perlu otentikasi
@Controller() // Kita akan definisikan path lengkap di method
// Guard sudah global
export class NotesController {
  private readonly logger = new Logger(NotesController.name);
  constructor(private readonly notesService: NotesService) {}

  // --- Endpoint Membuat Note untuk Task Tertentu ---
  @Post('tasks/:taskId/notes') // POST /api/tasks/123/notes
  @ApiOperation({ summary: 'Create a new note for a specific task' })
  @ApiParam({
    name: 'taskId',
    type: Number,
    description: 'ID of the task to add note to',
  })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully.',
    type: Note,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() createNoteDto: CreateNoteDto,
    @Req() request: Request,
  ): Promise<Note> {
    const user = request['user'] as UserPayload;
    this.logger.log(`User ${user.userId} creating note for task ${taskId}`);
    return this.notesService.create(createNoteDto, taskId, user.userId);
  }

  // --- Endpoint Mengambil Semua Note untuk Task Tertentu ---
  @Get('tasks/:taskId/notes') // GET /api/tasks/123/notes
  @ApiOperation({ summary: 'Get all notes for a specific task' })
  @ApiParam({
    name: 'taskId',
    type: Number,
    description: 'ID of the task to get notes for',
  })
  @ApiResponse({ status: 200, description: 'List of notes.', type: [Note] })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllByTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Req() request: Request,
  ): Promise<Note[]> {
    const user = request['user'] as UserPayload;
    return this.notesService.findAllByTask(taskId, user.userId);
  }

  // --- Endpoint Mengambil Satu Note Spesifik by ID Note ---
  // Kita letakkan di /notes/{id} agar struktur CRUD konsisten untuk note itu sendiri
  @Get('notes/:id') // GET /api/notes/456
  @ApiOperation({ summary: 'Get a specific note by its ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the note' })
  @ApiResponse({ status: 200, description: 'Note details.', type: Note })
  @ApiResponse({ status: 404, description: 'Note not found or access denied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<Note> {
    const user = request['user'] as UserPayload;
    return this.notesService.findOneByUser(id, user.userId);
  }

  // --- Endpoint Mengupdate Note Spesifik by ID Note ---
  @Put('notes/:id') // PUT /api/notes/456
  @ApiOperation({ summary: 'Update a specific note by its ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the note to update',
  })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully.',
    type: Note,
  })
  @ApiResponse({ status: 404, description: 'Note not found or access denied.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() request: Request,
  ): Promise<Note> {
    const user = request['user'] as UserPayload;
    return this.notesService.update(id, updateNoteDto, user.userId);
  }

  // --- Endpoint Menghapus Note Spesifik by ID Note ---
  @Delete('notes/:id') // DELETE /api/notes/456
  @ApiOperation({ summary: 'Delete a specific note by its ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the note to delete',
  })
  @ApiResponse({ status: 200, description: 'Note deleted successfully.' }) // Atau 204
  @ApiResponse({ status: 404, description: 'Note not found or access denied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<void> {
    const user = request['user'] as UserPayload;
    return this.notesService.remove(id, user.userId);
  }
}
