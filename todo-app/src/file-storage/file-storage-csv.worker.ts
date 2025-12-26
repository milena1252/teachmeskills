import { createReadStream } from "fs";
import * as path from "path";
import * as readline from 'readline';
import { TaskPriority } from "src/common/task-priority.enum";
import AppDataSource from "src/db/data-source";
import { Task } from "src/tasks/task.entity";
import { parentPort, workerData } from "worker_threads";

async function handleCsvImport(file: Express.Multer.File) {
    //to do -> HW 17
    //1. Read File
    //2. Handle line-by-line
    //3. Store in the Database
    //setTimeout(() => console.log(file.originalname), 10000);

    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const taskRepo = AppDataSource.getRepository(Task);

    const filePath = path.resolve(
        process.cwd(),
        'uploads',
        'csv',
        file.filename ?? file.originalname,
    );

    const stream = createReadStream(filePath);
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    let isHeader = true;
    let imported = 0;

    for await (const line of rl) {
        if (isHeader) {
            isHeader = false;
            continue;
        }

        const [title, ownerId, priority] = line.split(',');

        if (!title || !ownerId) continue;

        const task = taskRepo.create({
            title: title.trim(),
            ownerId: ownerId.trim(),
            priority: (priority as TaskPriority) ?? TaskPriority.MEDIUM,
            completed: false,
        });

        await taskRepo.save(task);
        imported++;
    }

    return {
        file: file.originalname,
        imported,
    };
}

handleCsvImport(workerData)
    .then((result) => parentPort?.postMessage(result))
    .catch((err) => 
        parentPort?.postMessage({
            error: err.message,
        }),
    );
