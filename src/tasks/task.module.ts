import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './task.controller';
import { TasksService } from './task.service';
import { Task } from './task.entity'; // Import Task entity
// Import AuthModule if you need to inject Auth related services directly here (usually not needed)
// import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]), // Register Task entity
    // AuthModule // Include if Guards/Strategies need setup specific to this module (not usually required if AuthModule is global or imported in AppModule)
  ],
  controllers: [TasksController],
  providers: [TasksService],
  // No exports needed typically unless another module depends on TasksService
})
export class TasksModule {}
