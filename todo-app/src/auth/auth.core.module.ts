import { forwardRef, Module } from "@nestjs/common";
import { TasksModule } from "src/tasks/tasks.module";
import { AuthService } from "./auth.service";

@Module({
    imports: [forwardRef(() => TasksModule)],
    providers: [AuthService],
    exports: [AuthService],
})

export class AuthCoreModule {}