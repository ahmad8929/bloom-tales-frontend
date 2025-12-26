export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  review: string;
  purchase: string;
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface BannerOffer {
  id: number;
  text: string;
  emoji: string;
}

// Hero Slides Data
export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: "/hero/hero1.png",
    title: "Style That Blooms",
    subtitle: "Discover curated collections that blend timeless elegance with modern trends.",
    cta: "Shop New Arrivals",
    link: "/products?isNewArrival=true"
  },
  {
    id: 2,
    image: "/hero/hero2.png",
    title: "Summer Breeze Collection",
    subtitle: "Light, airy, and ready for sunshine. Explore our latest summer styles.",
    cta: "Explore Summer",
    link: "/products?material=cotton"
  },
  {
    id: 3,
    image: "/hero/hero3.png",
    title: "For The Little Ones",
    subtitle: "Adorable outfits for every adventure. Dress them in comfort and style.",
    cta: "Shop Kids Wear",
    link: "/products?size=XS"
  },
  {
    id: 4,
    image: "/hero/hero4.png",
    title: "Traditional Elegance",
    subtitle: "Embrace heritage with our exquisite collection of sarees and ethnic wear.",
    cta: "Shop Traditional",
    link: "/products?material=silk"
  },
  {
    id: 5,
    image: "/hero/hero5.png",
    title: "Modern Chic",
    subtitle: "Contemporary styles for the modern woman. Sophistication meets comfort.",
    cta: "Shop Western",
    link: "/products?material=polyester"
  }
];

// Customer Testimonials
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    review: "The sarees from Bloomtales are absolutely stunning! The fabric quality is exceptional and the intricate embroidery work is breathtaking. I wore one to my cousin's wedding and received so many compliments.",
    purchase: "Silk Banarasi Saree",
    avatar: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Ananya Gupta",
    location: "Delhi",
    rating: 5,
    review: "I'm in love with their kurti collection! The designs are modern yet traditional, perfect for both office wear and casual outings. The fit is always perfect and the colors never fade.",
    purchase: "Cotton Block Print Kurti",
    avatar: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Sneha Patel",
    location: "Bangalore",
    rating: 5,
    review: "Finally found a place that has beautiful western dresses in Indian sizes! The quality is amazing and delivery was super fast. My daughter looks adorable in her new dress.",
    purchase: "Floral Summer Dress",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Meera Iyer",
    location: "Chennai",
    rating: 4,
    review: "Great collection for kids! My 5-year-old loves her new outfits and they're comfortable for her to play in. The customer service team was very helpful with size selection.",
    purchase: "Kids Ethnic Wear Set",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Kavya Nair",
    location: "Kochi",
    rating: 5,
    review: "Bloomtales has become my go-to for all special occasions. Their attention to detail and customer service is outstanding. The packaging is also very elegant!",
    purchase: "Designer Lehenga",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Ritu Singh",
    location: "Pune",
    rating: 5,
    review: "I was skeptical about online shopping for clothes, but Bloomtales exceeded my expectations. The return policy is genuine and the quality matches the photos perfectly.",
    purchase: "Handloom Cotton Saree",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face"
  }
];

// Categories Data
export const categories: Category[] = [
  {
    id: 1,
    name: "Cordset",
    slug: "cordset",
    image: "/shopByCategory/Cordset.jpeg"
  },
  {
    id: 2,
    name: "Anarkali",
    slug: "anarkali",
    image: "/shopByCategory/Anarkali.jpeg"
  },
  {
    id: 3,
    name: "Suite",
    slug: "suite",
    image: "/shopByCategory/Suite.jpeg"
  },
  {
    id: 4,
    name: "Saree",
    slug: "saree",
    image: "/shopByCategory/Saree.jpeg"
  },
  
  {
    id: 5,
    name: "Kurti",
    slug: "kurti",
    image: "/shopByCategory/Kurti.jpeg"
  },
  {
    id: 6,
    name: "Lehenga",
    slug: "lehenga",
    image: "/shopByCategory/Lehenga.jpeg"
  },
  {
    id: 7,
    name: "Western Dress",
    slug: "western-dress",
    image: "/shopByCategory/Western Dress.jpeg"
  },
];

// Features Data
export const features: Feature[] = [
  {
    id: 1,
    title: "Pan India Delivery",
    description: "Shipping across all of India at ₹149",
    icon: "truck"
  },
  {
    id: 2,
    title: "Secure Payment",
    description: "100% secure payment gateway",
    icon: "shield"
  },
  {
    id: 3,
    title: "Quality Assured",
    description: "Premium materials and craftsmanship",
    icon: "heart"
  },
  {
    id: 4,
    title: "Gift Wrapping",
    description: "Beautiful packaging for special occasions",
    icon: "gift"
  }
];

// Banner Offers
export const bannerOffers: BannerOffer[] = [
  {
    id: 1,
    emoji: "🎉",
    text: "Get your order delivered fast"
  },
  {
    id: 2,
    emoji: "🚚",
    text: "Shipping across India at just ₹149"
  },
  {
    id: 3,
    emoji: "⭐",
    text: "New arrivals every week - Stay tuned!"
  },
  {
    id: 4,
    emoji: "💝",
    text: "Special gift wrapping available for all orders"
  },
  {
    id: 5,
    emoji: "🔥",
    text: "Flash Sale: Check below!"
  },
  {
    id: 6,
    emoji: "🌟",
    text: "Join our instagram page for exclusive deals and updates"
  }
];