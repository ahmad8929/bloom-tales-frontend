
import type { ClothingItem } from "@/ai/flows/ai-style-recommendation";

export const productCategories = ['saree', 'kurti', 'western dress', 'baby boy', 'baby girl', 'boy dress', 'girl dress', 'cuddler dress'] as const;

export const products: ClothingItem[] = [
  // Sarees
  {
    id: "prod_001",
    name: "Classic Silk Saree",
    description: "An elegant magenta silk saree with a golden border, perfect for weddings and festive occasions.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "saree",
    availableSizes: ["One Size"],
    price: 4999,
    material: "Silk Blend",
    careInstructions: "Dry clean only.",
    reviews: [
        { id: 'rev_001', user: { name: 'Priya Patel', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 5, comment: 'Absolutely stunning saree! The quality of the silk is amazing.'},
        { id: 'rev_002', user: { name: 'Anjali Sharma', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 4, comment: 'Beautiful color, looks just like the picture. A bit pricey but worth it for special occasions.'},
    ]
  },
  {
    id: "prod_009",
    name: "Banarasi Weave Saree",
    description: "A stunning royal blue Banarasi saree with intricate gold zari work, a timeless classic.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "saree",
    availableSizes: ["One Size"],
    price: 7999,
    material: "Banarasi Silk",
    careInstructions: "Dry clean only."
  },
  {
    id: "prod_010",
    name: "Cotton Handloom Saree",
    description: "A comfortable and chic black cotton handloom saree with a simple striped pallu.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "saree",
    availableSizes: ["One Size"],
    price: 2499,
    material: "100% Cotton",
    careInstructions: "Hand wash separately.",
    reviews: [
        { id: 'rev_003', user: { name: 'Sunita Rao', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 5, comment: 'So soft and comfortable for daily wear. I love the minimalist design.'},
    ]
  },
  // Kurtis
  {
    id: "prod_002",
    name: "Embroidered Anarkali Kurti",
    description: "A beautiful floor-length Anarkali kurti with delicate floral embroidery. Ideal for celebrations.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "kurti",
    availableSizes: ["M", "L", "XL"],
    price: 2999,
    material: "Cotton Silk",
    careInstructions: "Hand wash or dry clean."
  },
  {
    id: "prod_011",
    name: "Printed Straight Kurti",
    description: "A casual straight-fit kurti with a vibrant geometric print, perfect for daily wear.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "kurti",
    availableSizes: ["S", "M", "L", "XL"],
    price: 1499,
    material: "Rayon",
    careInstructions: "Machine wash cold."
  },
  // Western Dresses
  {
    id: "prod_003",
    name: "Floral A-Line Western Dress",
    description: "A chic and breezy floral A-line dress, perfect for a brunch or a day out. Knee-length and made from soft crepe.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "western dress",
    availableSizes: ["S", "M", "L"],
    price: 2199,
    material: "Crepe",
    careInstructions: "Machine wash cold.",
     reviews: [
        { id: 'rev_004', user: { name: 'Neha Kumar', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 5, comment: 'Love this dress! It\'s so comfortable and the print is beautiful.'},
        { id: 'rev_005', user: { name: 'Kavita Singh', avatarUrl: 'https://placehold.co/40x40.png' }, rating: 4, comment: 'The fit is great and the material is soft. Perfect for summer.'},
    ]
  },
   {
    id: "prod_012",
    name: "Solid Maxi Dress",
    description: "An elegant solid-colored maxi dress with a waist tie-up, suitable for evening events.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "western dress",
    availableSizes: ["M", "L"],
    price: 2599,
    material: "Polyester",
    careInstructions: "Machine wash."
  },
  // Baby Boy
  {
    id: "prod_004",
    name: "Baby Boy's Romper Set",
    description: "An adorable and comfortable romper set for your little boy, featuring a cute animal print.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "baby boy",
    availableSizes: ["3-6M", "6-12M", "12-18M"],
    price: 999,
    material: "Organic Cotton",
    careInstructions: "Machine wash warm."
  },
  {
    id: "prod_013",
    name: "Dinosaur Print Dungaree Set",
    description: "A playful dungaree set with a dinosaur print t-shirt for your little explorer.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "baby boy",
    availableSizes: ["6-12M", "1-2Y"],
    price: 1299,
    material: "Cotton Blend",
    careInstructions: "Machine wash."
  },
  // Baby Girl
  {
    id: "prod_005",
    name: "Baby Girl's Ruffled Frock",
    description: "A delightful pink ruffled frock for baby girls. Soft, comfortable, and perfect for photoshoots.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "baby girl",
    availableSizes: ["3-6M", "6-12M", "12-18M"],
    price: 1199,
    material: "Cotton with Tulle",
    careInstructions: "Hand wash cold."
  },
  {
    id: "prod_014",
    name: "Bunny Applique Onesie",
    description: "A sweet onesie with a fluffy bunny applique on the front. Snap buttons for easy diaper changes.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "baby girl",
    availableSizes: ["0-3M", "3-6M"],
    price: 899,
    material: "100% Cotton",
    careInstructions: "Machine wash cold."
  },
  // Boy Dress
  {
    id: "prod_006",
    name: "Boy's Graphic T-shirt",
    description: "A cool and casual graphic t-shirt for boys, made with breathable cotton for all-day comfort.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "boy dress",
    availableSizes: ["4-5Y", "6-7Y", "8-9Y"],
    price: 699,
    material: "100% Cotton",
    careInstructions: "Machine wash."
  },
  {
    id: "prod_015",
    name: "Boy's Casual Shorts",
    description: "Comfortable and durable chino shorts for active boys. Perfect for playdates.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "boy dress",
    availableSizes: ["4-5Y", "6-7Y", "8-9Y"],
    price: 899,
    material: "Cotton Twill",
    careInstructions: "Machine wash."
  },
  // Girl Dress
  {
    id: "prod_007",
    name: "Girl's Tiered Maxi Dress",
    description: "A stylish tiered maxi dress for girls, perfect for parties and family gatherings. Features a comfortable elastic waist.",
    imageUrls: [
        "https://placehold.co/600x800.png",
        "https://placehold.co/600x800.png",
    ],
    category: "girl dress",
    availableSizes: ["4-5Y", "6-7Y", "8-9Y"],
    price: 1899,
    material: "Viscose",
    careInstructions: "Hand wash recommended."
  },
   {
    id: "prod_016",
    name: "Girl's Denim Jumpsuit",
    description: "A trendy and comfortable denim jumpsuit for girls. Perfect for a stylish day out.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "girl dress",
    availableSizes: ["6-7Y", "8-9Y", "10-11Y"],
    price: 2299,
    material: "Denim",
    careInstructions: "Machine wash cold."
  },
  // Cuddler Dress
  {
    id: "prod_008",
    name: "Kid's Cuddler Onesie",
    description: "A super-soft and warm cuddler onesie for kids, perfect for lounging at home on a chilly day.",
    imageUrls: [
        "https://placehold.co/600x800.png"
    ],
    category: "cuddler dress",
    availableSizes: ["2T", "3T", "4T"],
    price: 1599,
    material: "Fleece",
    careInstructions: "Machine wash cold."
  }
];
