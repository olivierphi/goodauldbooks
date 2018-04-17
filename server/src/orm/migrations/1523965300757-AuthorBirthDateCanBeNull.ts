import {MigrationInterface, QueryRunner} from "typeorm";

export class AuthorBirthDateCanBeNull1523965300757 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."author" ALTER COLUMN "birth_year" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "public"."author" ALTER COLUMN "birth_year" DROP NOT NULL`);
        await queryRunner.query(`DROP INDEX "idx_fts_search"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`-- TODO: revert DROP INDEX "idx_fts_search"`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author" ALTER COLUMN "birth_year" DROP NOT NULL`);
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."author" ALTER COLUMN "birth_year" TYPE integer`);
    }

}
