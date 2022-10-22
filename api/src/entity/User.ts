import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  bio: string = '';

  @Column()
  pfp: string = 'pfp.jpg';

  @Column({ nullable: true })
  confirm: string | null;

  @Column()
  token_v: number = 0;
}

export const makeSafe = (user: User) => {
  // Optionalize User type
  const safe: Partial<User> = { ...user };

  // Remove these fields for public consumption
  delete safe.password;
  delete safe.email;
  delete safe.id;
  delete safe.token_v;
  delete safe.confirm;

  // Done!
  return safe;
};

export const removePassword = (user: User) => {
  const safe: Omit<User, 'password' | 'token_v' | 'confirm'> = { ...user };
  delete safe['password'];
  delete safe['token_v'];
  delete safe['confirm'];
  return safe;
};
