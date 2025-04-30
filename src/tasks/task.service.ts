// src/tasks/task.service.ts (Lengkap dengan Relasi Category di findAll)
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike, Not, Between } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  /**
   * Membuat task baru untuk user tertentu.
   */
  async createTask(
    createTaskDto: CreateTaskDto,
    userId: number,
  ): Promise<Task> {
    const { title, description, deadline, status, categoryId } = createTaskDto;

    let deadlineDate: Date;
    try {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error();
      }
    } catch (error) {
      throw new BadRequestException(
        'Invalid deadline date format. Please use ISO 8601 format.',
      );
    }

    const task = this.taskRepository.create({
      title,
      description,
      deadline: deadlineDate,
      status: status || TaskStatus.ToDo,
      userId: userId,
      categoryId: categoryId, // <-- Pastikan ini sudah ada
    });

    return this.taskRepository.save(task);
  }

  /**
   * Mencari semua task milik user tertentu, dengan opsi filter dan sort.
   * Sekarang menyertakan data kategori terkait.
   */
  async findAll(
    userId: number,
    status?: TaskStatus,
    search?: string,
    sortBy: 'createdAt' | 'deadline' = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<Task[]> {
    // Buat objek opsi query TypeORM
    const queryOptions: FindManyOptions<Task> = {
      where: { userId: userId }, // Selalu filter berdasarkan userId
      order: { [sortBy]: sortOrder }, // Terapkan sorting
      // --- PASTIKAN RELASI DIAKTIFKAN ---
      relations: ['category'], // <-- Muat data dari tabel 'categories' yang berelasi
      // --- AKHIR PERUBAHAN PENTING ---
    };

    // Logika filter status dan search tetap sama, TAPI perlu disesuaikan
    // agar bekerja dengan benar saat 'where' menjadi array karena search

    let baseWhere: any = { userId: userId }; // Mulai dengan filter user
    if (status) {
      baseWhere.status = status; // Tambahkan status jika ada
    }

    if (search) {
      const searchPattern = ILike(`%${search}%`);
      // Buat array kondisi OR, pastikan baseWhere (userId dan status jika ada) ada di kedua kondisi
      queryOptions.where = [
        { ...baseWhere, title: searchPattern },
        { ...baseWhere, description: searchPattern },
      ];
    } else {
      // Jika tidak ada search, where cukup objek tunggal baseWhere
      queryOptions.where = baseWhere;
    }

    // Jalankan query find
    return this.taskRepository.find(queryOptions);
  }

  /**
   * Mencari satu task spesifik berdasarkan ID dan memastikan kepemilikan user.
   */
  async findOne(id: number, userId: number): Promise<Task> {
    // Saat mengambil satu task, juga muat relasi kategorinya jika perlu ditampilkan di detail
    const task = await this.taskRepository.findOne({
      where: { id: id, userId: userId },
      relations: ['category'], // <-- Muat juga relasi category di sini
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    return task;
  }

  /**
   * Mengupdate task yang sudah ada.
   */
  async updateTask(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    // findOne sudah mengambil task beserta relasi category jika ada
    const task = await this.findOne(id, userId);

    // Terapkan perubahan dari DTO
    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      task.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) task.status = updateTaskDto.status;
    if (updateTaskDto.deadline !== undefined) {
      try {
        const deadlineDate = new Date(updateTaskDto.deadline);
        if (isNaN(deadlineDate.getTime()))
          throw new Error('Invalid date format');
        task.deadline = deadlineDate;
      } catch (error) {
        throw new BadRequestException('Invalid deadline date format.');
      }
    }
    // Update categoryId jika ada di DTO (termasuk jika nilainya null)
    if (updateTaskDto.categoryId !== undefined) {
      task.categoryId = updateTaskDto.categoryId;
    }

    // Simpan perubahan
    try {
      // Simpan entity yang sudah diubah
      const updatedTask = await this.taskRepository.save(task);
      // Muat ulang relasi category secara eksplisit jika save tidak mengembalikannya
      // (tergantung versi TypeORM, kadang perlu)
      if (!updatedTask.category && updatedTask.categoryId) {
        const reloadedTask = await this.findOne(updatedTask.id, userId); // Panggil findOne lagi
        return reloadedTask;
      }
      return updatedTask;
    } catch (error) {
      console.error('Error saving updated task:', error);
      // Cek jika error karena foreign key categoryId tidak valid
      if (error.code === '23503') {
        // Kode error PostgreSQL untuk foreign key violation
        throw new BadRequestException(
          `Category with ID ${updateTaskDto.categoryId} does not exist.`,
        );
      }
      throw new BadRequestException('Could not update task.');
    }
  }

  /**
   * Menghapus task berdasarkan ID.
   */
  async removeTask(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId); // Verifikasi kepemilikan
    const result = await this.taskRepository.delete({ id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} could not be deleted.`);
    }
  }

  /**
   * Mendapatkan ringkasan jumlah task.
   */
  async getSummary(
    userId: number,
  ): Promise<{ completed: number; pending: number; nearDeadline: number }> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const completed = await this.taskRepository.countBy({
      userId: userId,
      status: TaskStatus.Done,
    });
    const pending = await this.taskRepository.count({
      where: { userId: userId, status: Not(TaskStatus.Done) },
    });
    const nearDeadline = await this.taskRepository.count({
      where: {
        userId: userId,
        status: Not(TaskStatus.Done),
        deadline: Between(now, sevenDaysFromNow),
      },
    });

    return { completed, pending, nearDeadline };
  }
}
