// src/tasks/task.entity.ts (Relasi Note Diaktifkan Kembali)
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Note } from '../notes/note.entity'; // <-- HAPUS KOMENTAR impor ini
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Done = 'Done',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Kolom Asli ---
  @Column({ length: 255 }) title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'timestamp with time zone' }) deadline: Date;
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.ToDo })
  status: TaskStatus;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  // --- Akhir Kolom Asli ---

  // --- Relasi ke User ---
  @Index() @Column() userId: number;
  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // --- Relasi ke Category ---
  @Index({ where: '"categoryId" IS NOT NULL' })
  @Column({ nullable: true })
  categoryId: number | null;
  @ManyToOne(() => Category, (category) => category.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  // --- Relasi ke Note (DIAKTIFKAN KEMBALI) ---
  @OneToMany(() => Note, (note) => note.task) // <-- HAPUS KOMENTAR decorator ini
  notes: Note[]; // <-- HAPUS KOMENTAR properti ini
}
