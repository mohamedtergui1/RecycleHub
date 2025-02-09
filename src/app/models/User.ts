export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  phone: string;
  birthday: string;
  profilePhoto?: string;
  isCollector: boolean;
  totalPoints?: number;
  convertedAmount?: number;
}
