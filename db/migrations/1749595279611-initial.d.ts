import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Initial1749595279611 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
