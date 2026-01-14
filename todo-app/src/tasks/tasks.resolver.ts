import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { TaskType } from "./task.type";
import { TasksService } from "./tasks.service";
import { CreateTaskInput } from "./create-task.input";
import { UpdateTaskInput } from "./update-task.input";
import { TaskByIdLoader } from "./tasks-by-id.loader";
import { UserByIdLoader } from "src/users/user-by-id.loader";
import { Inject } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { UserType } from "src/users/user.type";

@Resolver(() => TaskType)
export class TasksResolver {
    constructor(
        private readonly tasksService: TasksService,
        private readonly tasksByIdLoader: TaskByIdLoader,
        private readonly userByIdloader: UserByIdLoader,
        @Inject('PUB_SUB') private readonly pubSub: PubSub,
    ) {}

    @Query(() => [TaskType], { name: 'tasks' })
    findAll() {
        return this.tasksService.findAll();
    }

    @Query(() => TaskType, { name: 'task' })
    findOne(@Args('id', { type: () => ID }) id: string) {
        //return this.tasksService.findOne(id);
        return this.tasksByIdLoader.loader.load(id);
    }

    @Mutation(() => TaskType)
    async createTask(@Args('input') input: CreateTaskInput) {
       const task = await this.tasksService.create(input);

       await this.pubSub.publish('taskCreated', { taskCreated: task });
        
       return task;
    }

    @Mutation(() => TaskType)
    updateTask(@Args('input') input: UpdateTaskInput) {
        return this.tasksService.update(input.id, input);
    }

    @Mutation(() => Boolean)
    removeTask(@Args('id', { type: () => ID }) id: string) {
        return this.tasksService.remove(id).then(() => true);
    }

    @ResolveField(() => UserType, { name: 'owner' })
    owner(@Parent() task: TaskType) {
    // return this.usersService.findOne(task.ownerId);
    return this.userByIdloader.loader.load(task.ownerId);
  }

}