import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloomModule } from '@app/geo/geo.module';

@Module({
  imports: [BloomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
