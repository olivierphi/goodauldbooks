import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { utf8 } from "./_utf8_collation";
import { Book } from "./book";

@Entity()
export class Author {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 255, nullable: false, ...utf8 })
  public firstName!: string;

  @Column({ type: "varchar", length: 255, nullable: false, ...utf8 })
  public lastName!: string;

  @Column({ type: "int", /* length: 4, */ nullable: false })
  public birthYear!: number;

  @Column({ type: "int", /* length: 4, */ nullable: true })
  public deathYear!: number | null;

  @ManyToMany(type => Book, book => book.authors)
  @JoinTable()
  public books!: Book[];
}
