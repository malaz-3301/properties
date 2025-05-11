import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PropertiesModule,
    TypeOrmModule.forFeature([Vote, Property, User]),
  ],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
