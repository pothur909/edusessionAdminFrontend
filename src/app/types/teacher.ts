export interface SearchCard {
  _id: string;
  board?: string;
  className?: string;
  subject?: string;
  classType?: 'special' | 'normal';
  type?: 1 | 2;
  specialCourseName?: string;
}

export interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  searchCard: string;
}