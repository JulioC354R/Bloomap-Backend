import { Logger, Module } from '@nestjs/common';
import { LocationGeocodingService } from './geo.service';
import { CompleteBloomService } from './bloom.service';
import { BloomController } from './geo.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register()],
  controllers: [BloomController],
  providers: [LocationGeocodingService, CompleteBloomService],
})
export class BloomModule {}
