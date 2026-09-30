import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @IsPositive()
  menuItemId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
