import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { TaskPriority } from "src/common/task-priority.enum";

export class UpdateTaskDto {
    @IsString()
    @MinLength(3)
    @IsOptional()
    title?: string;

    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString()
    deadline?: string | Date;
}