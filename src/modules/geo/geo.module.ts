import { Module } from '@nestjs/common';
import { LocationService } from './geo.service';
import { BloomService } from './bloom.service';
import { GeoController } from './geo.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register()],
  controllers: [GeoController],
  providers: [LocationService, BloomService],
})
export class BloomModule {}
