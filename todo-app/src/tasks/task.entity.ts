import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn, 
    Entity, 
    Index, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn 
} from "typeorm";

@Entity('tasks')
@Index(['ownerId', 'completed'])
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string; 

    @Column({ length: 255 })
    title: string;

    @Column({ default: false })
    completed: boolean;

    @Column()
    @Index()
    ownerId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date | null;
}

//c99a014b-8285-43f9-9576-247147413c77