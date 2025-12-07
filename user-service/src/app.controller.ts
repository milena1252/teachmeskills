import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern, Payload, RpcException } from '@nestjs/microservices';

interface CreateUserPayload {
  requestId: string;
  name: string;
}

const processedRequests = new Map<string, any>();

@Controller()
export class AppController {
  constructor(@Inject('EMAIL_CLIENT') private client: ClientProxy) {}

  @MessagePattern('get-user')
  handleGetUser(@Payload() data: {id: number}) {
    return { id: data.id, name: 'John Doe' };
  }

  @EventPattern('create-user')
  handleUserCreated(@Payload() data: any) {
    const { requestId, traceId, name, email } = data;

    if (processedRequests.has(requestId)) {
      console.log('[user-service] duplicate req, returning cached result', requestId);
      return processedRequests.get(requestId);
    }

    if (Math.random() < 0.5) {
      console.log('[user-service] failure, throwing RPC exception', requestId);
      throw new RpcException('User Creation error');
    }

    const createdUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    processedRequests.set(requestId, createdUser);
    console.log('[user-service] user created successfully', requestId);

    this.client.emit('user-created', {
      traceId,
      email,
    });

    return createdUser;
  }

  @EventPattern('user-created')
  handleUserCreatedEvent(@Payload() data: { traceId: string; email: string }) {
    console.log('[user-service] event user-created received', data);
  }

}
