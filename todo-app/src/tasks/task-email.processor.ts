import { Process, Processor } from "@nestjs/bull";
import type { Job } from "bull";

type SendWelcomeJob = {
    ownerId: string;
    taskId: string;
};

@Processor('email')
export class TaskEmailProcessor{
    @Process('send-welcome')
    async sendWelcome(job: Job<SendWelcomeJob>) {
        const { ownerId, taskId } = job.data;

        console.log(`Sending welcome notification owner: ${ownerId} task: ${taskId}`);

        await job.log(`Send welcome for user ${ownerId}`);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`Welcome notification sent to user ${ownerId}`);

        await job.log('Welcome notification completed');
    }
}
