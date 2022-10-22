import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  their_id: string;

  @Column()
  short_id: string;

  @Column()
  title: string;

  @Column()
  is_public: boolean = true;

  @Column({ nullable: true })
  password: string;

  @Column()
  url: string;

  @Column()
  player_count: number = 0;
}

export const safeRoom = (room: Room) => {
  return {
    ...room,
    is_public: undefined,
    password: undefined
  };
};
