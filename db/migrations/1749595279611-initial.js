"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initial1749595279611 = void 0;
class Initial1749595279611 {
    name = 'Initial1749595279611';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "otp" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "createdAt"`);
    }
}
exports.Initial1749595279611 = Initial1749595279611;
//# sourceMappingURL=1749595279611-initial.js.map