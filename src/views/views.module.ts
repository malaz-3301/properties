import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { ViewsController } from './views.controller';
import { View } from './entities/view.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    PropertiesModule,
    UsersModule,
    TypeOrmModule.forFeature([View, User]),
  ],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
