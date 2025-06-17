import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1749595279611 implements MigrationInterface {
    name = 'Initial1749595279611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "createdAt"`);
    }

}
