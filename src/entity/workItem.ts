import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class WorkItem {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        length: 100,
    })
    public content: string;

    @Column({ default: false })
    public isChecked: boolean;

    @CreateDateColumn({type: "timestamp"})
    public createdAt: Date;

    @UpdateDateColumn({type: "timestamp"})
    public updatedAt: Date;
}
