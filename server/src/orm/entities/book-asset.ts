import {
  Column,
  ColumnOptions,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./book";

@Entity("book_asset")
export class BookAsset {
  @PrimaryGeneratedColumn() public id!: number;

  @Column({ type: "varchar", length: 500, nullable: false, unique: true })
  public path!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  public type!: string;

  @Column({ type: "integer", nullable: false })
  public size!: number;

  @ManyToOne(type => Book, book => book.assets)
  public book!: Book;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
}
