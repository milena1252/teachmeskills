import { Process, Processor } from "@nestjs/bull";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import type { Job } from "bull";

type InvalidateTaskCacheJob = {
    taskId: string;
};

@Processor('tasks')
export class TaskCacheProcessor {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

    @Process('invalidate-task-cache')
    async invalidateTaskCache(job: Job<InvalidateTaskCacheJob>) {
        const { taskId } = job.data;

        const key = `tasks:${taskId}`;
        await this.cache.del(key);

        await job.log?.(`Cache Invalidated: ${key}`);
    }
}