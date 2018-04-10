import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

const utf8 = { charset: "utf8", collation: "utf8_general_ci" };

@Entity()
export class Book {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  public title!: string;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  public slug!: string;
}
