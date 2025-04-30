// src/notes/notes.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { TasksService } from '../tasks/task.service'; // Import TasksService untuk verifikasi kepemilikan task

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    // Inject TasksService untuk memeriksa apakah user punya akses ke task
    private tasksService: TasksService,
  ) {}

  // Helper untuk cek akses user ke task induk
  private async checkTaskAccess(taskId: number, userId: number): Promise<void> {
    // Gunakan service task untuk mencari task berdasarkan ID dan User ID
    // Ini akan otomatis melempar NotFoundException jika task tidak ada atau bukan milik user
    await this.tasksService.findOne(taskId, userId);
  }

  async create(
    createNoteDto: CreateNoteDto,
    taskId: number,
    userId: number,
  ): Promise<Note> {
    // Pastikan user punya akses ke task sebelum membuat note
    await this.checkTaskAccess(taskId, userId);

    const note = this.noteRepository.create({
      ...createNoteDto,
      taskId: taskId,
      // Jika perlu mencatat userId di Note: userId: userId,
    });
    return this.noteRepository.save(note);
  }

  async findAllByTask(taskId: number, userId: number): Promise<Note[]> {
    // Pastikan user punya akses ke task sebelum melihat notes-nya
    await this.checkTaskAccess(taskId, userId);

    return this.noteRepository.find({
      where: { taskId: taskId },
      order: { createdAt: 'ASC' },
    });
  }

  // Mencari note spesifik berdasarkan ID-nya, TAPI kita harus tetap cek kepemilikan Task induknya
  async findOneByUser(id: number, userId: number): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id: id },
      relations: ['task'], // Sertakan relasi task untuk bisa cek userId-nya
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found.`);
    }

    // Cek apakah task induknya milik user yang sedang login
    // Kita perlu load relasi 'task' untuk mendapatkan task.userId
    // atau bisa juga join manual di query findOne
    // Cara 1: Cek setelah load relasi (jika relasi task di-load)
    if (note.task?.userId !== userId) {
      // Cek userId dari task yang berelasi
      throw new ForbiddenException(
        `You do not have access to the task associated with note ID ${id}.`,
      );
    }
    // Cara 2: Query langsung dengan join (lebih efisien jika tidak perlu objek task utuh)
    // const note = await this.noteRepository.findOne({
    //     where: { id: id, task: { userId: userId } }, // Filter berdasarkan userId di task yang berelasi
    // });
    // if (!note) {
    //   throw new NotFoundException(`Note with ID ${id} not found or you don't have access.`);
    // }

    return note;
  }

  async update(
    id: number,
    updateNoteDto: UpdateNoteDto,
    userId: number,
  ): Promise<Note> {
    // findOneByUser sudah termasuk pengecekan akses via task induk
    const note = await this.findOneByUser(id, userId);

    if (updateNoteDto.content !== undefined) {
      note.content = updateNoteDto.content;
    }

    return this.noteRepository.save(note);
  }

  async remove(id: number, userId: number): Promise<void> {
    // findOneByUser sudah termasuk pengecekan akses via task induk
    await this.findOneByUser(id, userId);

    const result = await this.noteRepository.delete({ id: id }); // Cukup delete by note ID

    if (result.affected === 0) {
      throw new NotFoundException(`Note with ID ${id} not found.`);
    }
  }
}
