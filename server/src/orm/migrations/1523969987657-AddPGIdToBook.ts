import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPGIdToBook1523969987657 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."book" ADD "projetGutenberId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."book" ALTER COLUMN "title" TYPE character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`-- TODO: revert ALTER TABLE "public"."book" ALTER COLUMN "title" TYPE character varying(500)`);
        await queryRunner.query(`ALTER TABLE "public"."book" DROP "projetGutenberId"`);
    }

}
