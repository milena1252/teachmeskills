import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { TaskPriority } from "../task-priority.enum";

@Injectable()
export class TaskPriorityPipe implements PipeTransform {
    readonly allowedPriorities = [
        TaskPriority.HIGH,
        TaskPriority.MEDIUM,
        TaskPriority.LOW,
    ];

    transform(value: any) {
        if (!value || typeof value !== 'object') {
            return value;
        }

        const { priority, deadline } = value;

        if (priority === undefined || priority === null) {
            return value;
        }

        if (!this.isValidPriorities(priority)) {
            throw new BadRequestException(`Invalid priority: ${priority}`);
        }

        if (priority === TaskPriority.HIGH && !this.validateHighPriority(deadline)) {
            throw new BadRequestException('HIGH -> deadline must be at least 24h ahead');
        }

        if (priority === TaskPriority.MEDIUM && !this.validateMediumPriority(deadline)) {
            throw new BadRequestException('MEDIUM -> deadline must be in the future');
        }
         
        return value;
    }

    private isValidPriorities(priority: string): boolean {
        return this.allowedPriorities.includes(priority as TaskPriority);
    }  

    private validateHighPriority(deadline?: string): boolean {
        if (!deadline) return false;

        const diffMs = (new Date(deadline).getTime() - Date.now());
        const ONE_DAY = 24 * 60 * 60 * 1000;
        return diffMs >= ONE_DAY;
    }

    private validateMediumPriority(deadline: string): boolean {
        if (!deadline) return false;

        return new Date(deadline).getTime() > Date.now();
    } 
}