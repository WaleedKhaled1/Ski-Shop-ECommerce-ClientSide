export interface Order {
  id: number;
  orderDate: string;
  buyerEmail: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
  shippingPrice: number;
  paymentSummary: PaymentSummary;
  orderItems: OrderItem[];
  subTotal: number;
  total: number;
  status: string;
  paymentIntentId: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentSummary {
  brand: string;
  last4: number;
  expMonth: number;
  expYear: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface CreateOrderDto {
  cartId: string;
  shippingAddress: ShippingAddress;
  paymentSummary: PaymentSummary;
  deliveryMethodId: number;
}
