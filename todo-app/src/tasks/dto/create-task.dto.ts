import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";
import { TaskPriority } from "src/common/task-priority.enum";

export class CreateTaskDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsString()
    @MinLength(3)
    userId: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean = false;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsISO8601()
    deadline?: string;
}