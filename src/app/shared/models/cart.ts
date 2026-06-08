import { nanoid } from 'nanoid';

export type CartType = {
  id: string;
  items: CartItem[];
};

export type CartItem = {
  productId: number;
  productName: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantity: number;
};

export class Cart implements CartType {
  id: string = nanoid();
  items: CartItem[] = [];
}
