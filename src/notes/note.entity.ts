// src/notes/note.entity.ts (Relasi Balik Diaktifkan Kembali)
import { Task } from '../tasks/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { User } from '../users/user.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column()
  taskId: number;

  // --- Relasi Balik Diaktifkan Kembali ---
  @ManyToOne(() => Task, (task) => task.notes, {
    // <-- HAPUS KOMENTAR di sini
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: Task;
  // --- Akhir Pengaktifan Kembali ---

  // --- Relasi User (Tetap dikomentari jika tidak dipakai) ---
  // @Index()
  // @Column()
  // userId: number;
  // ...

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
}
