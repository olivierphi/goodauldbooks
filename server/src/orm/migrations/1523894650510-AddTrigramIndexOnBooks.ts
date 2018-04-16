import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrigramIndexOnBooks1523894650510 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    await queryRunner.query(
      "CREATE INDEX IF NOT EXISTS idx_fts_search ON book USING GIN(fulltext_content gin_trgm_ops);"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
