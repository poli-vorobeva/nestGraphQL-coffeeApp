import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './coffees/entities/coffee.entity/coffee.entity';
import {Flavor} from './coffees/entities/flavor.entity/flavor.entity'
import { DateScalar } from './common/scalrs/date.scalar/date.scalar';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      port: 5555,
      username: 'postgres',
      password: 'pass123',
      database: 'postgres',
      entities:[Coffee,Flavor],
      synchronize: true
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths:['./**/*.graphql'],
    }),
    CoffeesModule,
  ],
  controllers: [AppController],
  providers: [AppService,DateScalar],
})
export class AppModule {}
