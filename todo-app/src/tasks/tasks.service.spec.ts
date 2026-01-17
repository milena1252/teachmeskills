import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { getQueueToken } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { ConflictException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  const queryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const repo = {
    exists: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  const cache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const queue = {
    add: jest.fn(),
  };

  beforeEach(async() => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repo },
        { provide: getQueueToken('tasks'), useValue: queue },
        { provide: getQueueToken('email'), useValue: queue },
        { provide: CACHE_MANAGER, useValue: cache },
        { provide: DataSource, useValue: {}},
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('findAll returns tasks from query createQueryBuilder', async() => {
    const tasks = [
      { id: 't1', title: 'Task 1', completed: false },
      { id: 't2', title: 'Task 2', completed: true },
    ];
    
    queryBuilder.getMany.mockResolvedValue(tasks);

    const result = await service.findAll(10, 0);

    expect(repo.createQueryBuilder).toHaveBeenCalledWith('task');
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.getMany).toHaveBeenCalled();
    expect(result).toEqual(tasks);
  });

  it('throws ConflictException when title already exists', async () => {
   queryBuilder.getMany.mockResolvedValue([
    { id: 't1', title: 'existing' },
   ]);
    
    const dto: CreateTaskDto = {
      title: 'existing',
      userId: 'u1',
      completed: false,
    };
    
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
