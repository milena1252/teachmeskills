import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {

  @EventPattern('user-created')
  handleUserCreated(@Payload() data: { email: string }) {
    console.log(`[email-service] sending welcome email to ${data.email}`);
  }
}
