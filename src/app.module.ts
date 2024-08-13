import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/entities";
import { features } from "./index";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 8886,
      username: process.env.DATABASE_USER || 'admin',
      password: process.env.DATABASE_PASSWORD || '^1Wr04yB!NF8',
      database: process.env.DATABASE_NAME || 'authDB',
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    ...features,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
