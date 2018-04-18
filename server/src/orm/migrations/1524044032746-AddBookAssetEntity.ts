import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBookAssetEntity1524044032746 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "book_asset" ("id" SERIAL NOT NULL, "path" character varying(500) NOT NULL, "type" character varying(50) NOT NULL, "size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "bookId" integer, CONSTRAINT "uk_book_asset_path" UNIQUE ("path"), PRIMARY KEY("id"))`);
        await queryRunner.query(`ALTER TABLE "book_asset" ADD CONSTRAINT "fk_f57e549c1ef0d24ce2b01d61c0b" FOREIGN KEY ("bookId") REFERENCES "book"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "book_asset" DROP CONSTRAINT "fk_f57e549c1ef0d24ce2b01d61c0b"`);
        await queryRunner.query(`DROP TABLE "book_asset"`);
    }

}
