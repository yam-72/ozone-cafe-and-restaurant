import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Price must be a valid number with at most 2 decimal places',
    },
  )
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
