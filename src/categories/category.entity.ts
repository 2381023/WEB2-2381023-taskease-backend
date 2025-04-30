// src/categories/category.entity.ts
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity'; // Impor Task untuk relasi OneToMany
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

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  // Relasi ManyToOne ke User (Setiap kategori dibuat oleh satu user)
  @Index() // Index foreign key
  @Column()
  userId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' }) // Kategori dihapus jika user dihapus
  @JoinColumn({ name: 'userId' })
  user: User;

  // Relasi OneToMany ke Task (Satu kategori bisa punya banyak task)
  @OneToMany(() => Task, (task) => task.category)
  tasks: Task[]; // Nama properti untuk mengakses tasks dalam kategori ini

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
