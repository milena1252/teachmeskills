import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Task } from 'src/tasks/task.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.getRepository(Task).clear();
  });

  afterAll(async () => {
    await app.close();
  })

  it('/task:id (GET) returns real task', async () => {
    const repo = dataSource.getRepository(Task);

    const task = repo.create({
      title: 'Real task',
      completed: false,
      ownerId: 'u1',
    });
    const saved = await repo.save(task);

    return request(app.getHttpServer())
      .get(`/tasks/${saved.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(saved.id);
        expect(res.body.data.title).toBe(saved.title);
        expect(res.body.data.completed).toBe(saved.completed);
      });
  });
});
