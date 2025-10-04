import { Module } from '@nestjs/common';
import { LocationService } from './geo.service';
import { CompleteBloomService } from './bloom.service';
import { BloomController } from './geo.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register()],
  controllers: [BloomController],
  providers: [LocationService, CompleteBloomService],
})
export class BloomModule {}
