export type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  tags: string[]
  rating: number
  reviews: number
  stock: number
  featured?: boolean
  new?: boolean
  sale?: boolean
  discount?: number
  sustainabilityScore?: number
  colors?: string[]
  sizes?: string[]
  materials?: string[]
}

export type Category = {
  id: string
  name: string
  description: string
  image: string
  slug: string
  featured?: boolean
}

export type Review = {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
}
