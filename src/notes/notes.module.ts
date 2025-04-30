// src/notes/notes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './note.entity';
import { TasksModule } from '../tasks/task.module'; // Impor TasksModule karena NotesService butuh TasksService

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    TasksModule, // Sediakan TasksService untuk di-inject ke NotesService
  ],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
