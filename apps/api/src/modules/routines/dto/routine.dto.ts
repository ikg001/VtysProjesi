import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateRoutineDto {
  @ApiProperty({ example: 'Morning Workout' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ['daily', 'weekly'], example: 'daily' })
  @IsEnum(['daily', 'weekly'])
  frequency: 'daily' | 'weekly';

  @ApiPropertyOptional({ example: [1, 3, 5], description: '1=Mon, 7=Sun (for weekly only)' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  weekdays?: number[];

  @ApiPropertyOptional({ example: '07:00:00' })
  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @ApiPropertyOptional({ example: { goal: '30 minutes' } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class UpdateRoutineDto extends PartialType(CreateRoutineDto) {}

export class RoutineResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  frequency: string;

  @ApiProperty({ required: false })
  weekdays?: number[];

  @ApiProperty({ required: false })
  timeOfDay?: string;

  @ApiProperty()
  reminders: boolean;

  @ApiProperty()
  meta: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
