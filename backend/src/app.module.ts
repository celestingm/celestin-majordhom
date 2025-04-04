import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './controllers/contact.controller';
import { ContactService } from './services/contact.service';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Contact],
        synchronize: true,
        logging: true
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Contact]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class AppModule {} 