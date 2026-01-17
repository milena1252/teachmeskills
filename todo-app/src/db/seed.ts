import { Task } from "src/tasks/task.entity";
import dataSource from "./data-source";

async function seed() {
    await dataSource.initialize();

    const repo = dataSource.getRepository(Task);

    const count = await repo.count();
    if (count === 0) {
        await repo.save([
            repo.create({ title: 'seed task 1', ownerId:})
        ])
    }
}