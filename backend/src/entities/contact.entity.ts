import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  typedemande: string;

  @Column()
  genre: string;

  @Column({ nullable: true })
  pronom: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column({ nullable: true })
  disponibilite: string | null;

  @Column({ nullable: true })
  heureDebut: string | null;

  @Column({ nullable: true })
  heureFin: string | null;

  @Column('text')
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 