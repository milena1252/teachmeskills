import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriorityColumn1764236774300 implements MigrationInterface {
    name = 'AddPriorityColumn1764236774300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('high', 'medium', 'low')`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium'`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "deadline" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc913ba3ebec322f9f278ccf10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_607de52438268ab19a40634942"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "ownerId" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_607de52438268ab19a40634942" ON "tasks" ("ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc913ba3ebec322f9f278ccf10" ON "tasks" ("ownerId", "completed") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bc913ba3ebec322f9f278ccf10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_607de52438268ab19a40634942"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "ownerId" text NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_607de52438268ab19a40634942" ON "tasks" ("ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc913ba3ebec322f9f278ccf10" ON "tasks" ("completed", "ownerId") `);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deadline"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    }

}
