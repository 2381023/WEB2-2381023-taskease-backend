// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])], // Daftarkan Category entity
  controllers: [CategoriesController],
  providers: [CategoriesService],
  // Exports tidak diperlukan jika tidak ada modul lain yang butuh CategoriesService
})
export class CategoriesModule {}
