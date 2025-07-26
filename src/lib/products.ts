
import type { Product } from "@/types/product";

export const productCategories = ['saree', 'kurti', 'western dress', 'baby boy', 'baby girl', 'boy dress', 'girl dress', 'cuddler dress'] as const;

// Sample product data in the old format
const oldProducts = [
  {
    id: "prod_001",
    name: "Classic Silk Saree",
    description: "An elegant magenta silk saree with a golden border, perfect for weddings and festive occasions.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "saree",
    availableSizes: ["One Size"],
    price: 4999,
    material: "Silk Blend",
    careInstructions: "Dry clean only.",
    reviews: [
      { id: 'rev_001', user: { name: 'Priya Patel', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 5, comment: 'Absolutely stunning saree! The quality of the silk is amazing.' },
      { id: 'rev_002', user: { name: 'Anjali Sharma', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 4, comment: 'Beautiful color, looks just like the picture. A bit pricey but worth it for special occasions.' },
    ]
  },
  {
    id: "prod_002",
    name: "Embroidered Anarkali Kurti",
    description: "A beautiful floor-length Anarkali kurti with delicate floral embroidery.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "kurti",
    availableSizes: ["S", "M", "L", "XL"],
    price: 2999,
    material: "Cotton Silk",
    careInstructions: "Hand wash or dry clean."
  },
  {
    id: "prod_003",
    name: "Floral A-Line Dress",
    description: "A chic and breezy floral A-line dress, perfect for summer.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "western dress",
    availableSizes: ["S", "M", "L"],
    price: 2199,
    material: "Cotton",
    careInstructions: "Machine wash cold."
  },
  {
    id: "prod_004",
    name: "Baby Girl's Party Frock",
    description: "A beautiful party frock for your little princess.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "baby girl",
    availableSizes: ["6-12M", "1-2Y", "2-3Y"],
    price: 1499,
    material: "Polyester",
    careInstructions: "Hand wash."
  },
  {
    id: "prod_005",
    name: "Printed Cotton Saree",
    description: "A comfortable and stylish cotton saree for daily wear.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "saree",
    availableSizes: ["One Size"],
    price: 1999,
    material: "Cotton",
    careInstructions: "Machine wash."
  },
  {
    id: "prod_006",
    name: "Designer Kurti Set",
    description: "A trendy kurti set with palazzo pants.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "kurti",
    availableSizes: ["S", "M", "L"],
    price: 3499,
    material: "Rayon",
    careInstructions: "Hand wash."
  },
  {
    id: "prod_007",
    name: "Maxi Dress",
    description: "An elegant maxi dress for special occasions.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "western dress",
    availableSizes: ["S", "M", "L", "XL"],
    price: 2799,
    material: "Georgette",
    careInstructions: "Dry clean only."
  },
  {
    id: "prod_008",
    name: "Baby Girl's Summer Dress",
    description: "A cute and comfortable summer dress for baby girls.",
    imageUrls: [
      "https://placehold.co/600x800.png",
      "https://placehold.co/600x800.png",
    ],
    category: "baby girl",
    availableSizes: ["3-6M", "6-12M", "1-2Y"],
    price: 999,
    material: "Cotton",
    careInstructions: "Machine wash cold."
  }
];

// Helper function to convert old product format to new format
function convertToNewFormat(oldProduct: any): Product {
  return {
    _id: oldProduct.id,
    name: oldProduct.name,
    description: oldProduct.description,
    images: oldProduct.imageUrls || [],
    category: oldProduct.category,
    sizes: oldProduct.availableSizes || [],
    price: oldProduct.price,
    stockStatus: "inStock",
    quantity: 10,
    colors: [],
    reviews: oldProduct.reviews?.map((review: any) => ({
      userId: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString()
    })) || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Convert all products to new format
export const products: Product[] = oldProducts.map(convertToNewFormat);
