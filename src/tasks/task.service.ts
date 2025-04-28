import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

  async createTask(
    createTaskDto: CreateTaskDto,
    userId: number,
  ): Promise<Task> {
    const { title, description, deadline, status } = createTaskDto;

    // Convert deadline string to Date object safely
    let deadlineDate: Date;
    try {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        // Check if the conversion resulted in a valid date
        throw new Error(); // Trigger catch block if invalid
      }
    } catch (error) {
      throw new BadRequestException(
        'Invalid deadline date format. Please use ISO 8601 format.',
      );
    }

    const task = this.taskRepository.create({
      title,
      description,
      deadline: deadlineDate, // Use the converted Date object
      status: status || TaskStatus.ToDo, // Default if not provided
      userId: userId, // Associate with the logged-in user
    });

    return this.taskRepository.save(task);
  }

  async findAll(
    userId: number,
    status?: TaskStatus,
    search?: string,
    sortBy: 'createdAt' | 'deadline' = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC', // TypeORM uses 'ASC'/'DESC'
  ): Promise<Task[]> {
    const queryOptions: FindManyOptions<Task> = {
      where: { userId: userId }, // Base filter by user
      order: { [sortBy]: sortOrder },
    };

    // Add status filter if provided
    if (status) {
      queryOptions.where = { ...queryOptions.where, status: status };
    }

    // Add search filter if provided
    if (search) {
      const searchPattern = ILike(`%${search}%`); // Case-insensitive search
      // If status is also present, combine with AND within OR blocks
      if (status) {
        queryOptions.where = [
          { userId: userId, status: status, title: searchPattern },
          { userId: userId, status: status, description: searchPattern },
        ];
      } else {
        // If only search is present
        queryOptions.where = [
          { userId: userId, title: searchPattern },
          { userId: userId, description: searchPattern },
        ];
      }
    }

    return this.taskRepository.find(queryOptions);
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOneBy({
      id: id,
      userId: userId,
    });

    if (!task) {
      // Throw NotFound whether task doesn't exist or belongs to another user
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    return task;
  }

  async updateTask(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    // Use the findOne method which includes the ownership check
    const task = await this.findOne(id, userId);

    // Apply updates directly to the fetched 'task' entity instance
    // Check if the property exists (is not undefined) in the DTO before updating
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    // Allow setting description to null or string if provided in DTO
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }
    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }
    // Handle deadline conversion safely
    if (updateTaskDto.deadline !== undefined) {
      try {
        const deadlineDate = new Date(updateTaskDto.deadline);
        // Check if the conversion resulted in a valid date
        if (isNaN(deadlineDate.getTime())) {
          throw new Error('Invalid date format produced NaN');
        }
        task.deadline = deadlineDate; // Assign the converted Date object
      } catch (error) {
        // Catch errors from new Date() or the isNaN check
        throw new BadRequestException(
          'Invalid deadline date format. Please use ISO 8601 format.',
        );
      }
    }

    // Now save the modified 'task' entity
    // TypeORM's save method handles updates if the entity has an ID
    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error saving updated task:', error);
      // Provide a generic error message to the client
      throw new BadRequestException('Could not update task.');
    }
  }

  async removeTask(id: number, userId: number): Promise<void> {
    // Use findOne to verify ownership and existence first. It throws if not found/owned.
    await this.findOne(id, userId);

    const result = await this.taskRepository.delete({ id: id, userId: userId }); // Use primary key and userId for safety

    if (result.affected === 0) {
      // This case should ideally be caught by findOne, but acts as a safeguard
      throw new NotFoundException(`Task with ID ${id} could not be deleted.`);
    }
    // No return value needed for successful deletion
  }

  async getSummary(
    userId: number,
  ): Promise<{ completed: number; pending: number; nearDeadline: number }> {
    const now = new Date();
    // Calculate 7 days from now accurately
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Use TypeORM query methods for counting
    const completed = await this.taskRepository.count({
      where: { userId: userId, status: TaskStatus.Done },
    });

    const pending = await this.taskRepository.count({
      where: { userId: userId, status: Not(TaskStatus.Done) }, // Count tasks that are not 'Done'
    });

    const nearDeadline = await this.taskRepository.count({
      where: {
        userId: userId,
        status: Not(TaskStatus.Done), // Only pending tasks
        deadline: Between(now, sevenDaysFromNow), // Deadline is within the next 7 days (inclusive of start, exclusive of end by default)
      },
    });

    return { completed, pending, nearDeadline };
  }
}
