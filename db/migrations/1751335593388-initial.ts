import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1751335593388 implements MigrationInterface {
    name = 'Initial1751335593388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."property_heatingtype_enum" RENAME TO "property_heatingtype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."property_heatingtype_enum" AS ENUM('Central', 'Gas', 'Electric', 'Solar', 'None')`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "heatingType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "heatingType" TYPE "public"."property_heatingtype_enum" USING "heatingType"::"text"::"public"."property_heatingtype_enum"`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "heatingType" SET DEFAULT 'None'`);
        await queryRunner.query(`DROP TYPE "public"."property_heatingtype_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."property_status_enum" RENAME TO "property_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."property_status_enum" AS ENUM('pending', 'accepted', 'Rejected', 'Hidden')`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "status" TYPE "public"."property_status_enum" USING "status"::"text"::"public"."property_status_enum"`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."property_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum" RENAME TO "users_usertype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum" AS ENUM('super_admin', 'admin', 'agency', 'owner', 'pending')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum" USING "userType"::"text"::"public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'owner'`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_usertype_enum_old" AS ENUM('super_admin', 'admin', 'normal_user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" TYPE "public"."users_usertype_enum_old" USING "userType"::"text"::"public"."users_usertype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'super_admin'`);
        await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_usertype_enum_old" RENAME TO "users_usertype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."property_status_enum_old" AS ENUM('pending', 'accepted', 'rejected', 'hidden')`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "status" TYPE "public"."property_status_enum_old" USING "status"::"text"::"public"."property_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."property_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."property_status_enum_old" RENAME TO "property_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."property_heatingtype_enum_old" AS ENUM('Central', 'Gas', 'Electric', 'Underfloor', 'Wood', 'Solar', 'None')`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "heatingType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "heatingType" TYPE "public"."property_heatingtype_enum_old" USING "heatingType"::"text"::"public"."property_heatingtype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "property" ALTER COLUMN "heatingType" SET DEFAULT 'None'`);
        await queryRunner.query(`DROP TYPE "public"."property_heatingtype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."property_heatingtype_enum_old" RENAME TO "property_heatingtype_enum"`);
    }

}
