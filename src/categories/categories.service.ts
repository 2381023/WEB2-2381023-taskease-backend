// src/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      userId: userId, // Set pemilik kategori
    });
    return this.categoryRepository.save(category);
  }

  async findAllByUser(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { userId: userId },
      order: { createdAt: 'ASC' }, // Urutkan berdasarkan nama atau tanggal
    });
  }

  async findOneByUser(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({
      id: id,
      userId: userId,
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${id} not found or you don't have access.`,
      );
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    userId: number,
  ): Promise<Category> {
    // findOneByUser sudah termasuk pengecekan kepemilikan
    const category = await this.findOneByUser(id, userId);

    // Update nama jika ada di DTO
    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number, userId: number): Promise<void> {
    // findOneByUser sudah termasuk pengecekan kepemilikan
    await this.findOneByUser(id, userId);

    const result = await this.categoryRepository.delete({
      id: id,
      userId: userId,
    });

    if (result.affected === 0) {
      // Seharusnya tidak terjadi jika findOneByUser berhasil, tapi sebagai pengaman
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    // Perhatian: Menghapus kategori tidak otomatis menghapus task yg terkait
    // Jika ingin menghapus task juga, perlu logika tambahan atau cascade di DB (tidak disarankan di sini)
    // Jika ingin melepaskan task dari kategori, perlu update task (set categoryId jadi null)
  }
}
