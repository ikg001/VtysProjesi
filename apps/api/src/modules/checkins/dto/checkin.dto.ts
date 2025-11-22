import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckinDto {
  @ApiProperty()
  @IsUUID()
  routineId: string;

  @ApiProperty({ example: '2025-11-12' })
  @IsDateString()
  checkinDate: string;

  @ApiProperty({ enum: ['done', 'skipped'] })
  @IsEnum(['done', 'skipped'])
  status: 'done' | 'skipped';

  @ApiPropertyOptional({ example: 'Completed 5km run' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: { distance: 5.2, duration: 28 } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class MarkDoneDto {
  @ApiPropertyOptional({ example: 'Felt amazing!' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: { distance: 5.2 } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class QueryCheckinsDto {
  @ApiPropertyOptional({ example: '2025-11-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2025-11-30' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class CheckinResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  routineId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  checkinDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty()
  meta: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
