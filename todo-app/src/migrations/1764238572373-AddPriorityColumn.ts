import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriorityColumn1764238572373 implements MigrationInterface {
    name = 'AddPriorityColumn1764238572373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('high', 'medium', 'low')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium', "deadline" TIMESTAMP WITH TIME ZONE, "completed" boolean NOT NULL DEFAULT false, "ownerId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_607de52438268ab19a40634942" ON "tasks" ("ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc913ba3ebec322f9f278ccf10" ON "tasks" ("ownerId", "completed") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bc913ba3ebec322f9f278ccf10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_607de52438268ab19a40634942"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    }

}
