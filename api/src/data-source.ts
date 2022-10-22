import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Room } from "./entity/Room"

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "cubes",
  synchronize: true,
  logging: false,
  entities: [User, Room],
  migrations: [],
  subscribers: [],
  migrationsTableName: "cwm_migrations"
})

export default dataSource;
