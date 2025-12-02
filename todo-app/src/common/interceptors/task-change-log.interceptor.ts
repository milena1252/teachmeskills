import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Task } from "src/tasks/task.entity";
import { TasksService } from "src/tasks/tasks.service";

@Injectable()
export class TaskChangeLogInterceptor implements NestInterceptor {
    constructor(private readonly taskService: TasksService) {}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const { method, url, body, params } = req;

        const changeMethod = ['POST', 'PATCH', 'PUT', 'DELETE'];

        if (!changeMethod.includes(method)) return next.handle();
        
        let before: Task | null = null;

        if (['PATCH', 'PUT', 'DELETE'].includes(method) && params.id) {
            try {
                before = await this.taskService.findOne(params.id);
            } catch(error) {
                before = null;
            }
        }

        return next.handle().pipe(
            tap(result => {
                const log: any = {
                    method,
                    url,
                    data: body
                };

                if (before && result) {
                    log.diff = this.diff(before, result);
                }

                console.log("Task log:", log);
            })
        );
        
    }

    private diff(oldObj: Task, newObj: any) {
        const changes: any = {};
        for (const key in newObj) {
            if (oldObj[key] !== newObj[key]) {
                changes[key] = { from: oldObj[key], to: newObj[key] };
            }
        }
        return changes;
    }
}