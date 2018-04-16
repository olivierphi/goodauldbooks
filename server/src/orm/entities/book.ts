import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Lang } from "../../domain/import";
import { utf8 } from "./_utf8_collation";
import { Author } from "./author";

@Entity()
export class Book {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true, ...utf8 })
  public title!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, nullable: false, unique: true, ...utf8 })
  public slug!: string;

  @ManyToMany(type => Author, author => author.books)
  public authors!: Author[];

  @Column({ type: "varchar", length: 2, nullable: false })
  public lang!: Lang;

  // @Column({ type: "tsvector", nullable: false })
  @Column({ type: "text", nullable: false })
  public fullTextContent!: string;

  @CreateDateColumn() public createdAt!: Date;
}
