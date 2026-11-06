export interface MenuItem {
  id: string;
  name: string;
  urduName: string;
  category: 'bbq' | 'karahi' | 'handi' | 'biryani' | 'tandoor' | 'desserts' | 'drinks';
  description: string;
  price: number;
  popular?: boolean;
  spicyLevel?: 1 | 2 | 3;
  serves: string;
  image: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  category: 'BBQ' | 'Karahi' | 'Family Dining' | 'Hospitality';
  comment: string;
  highlight: string;
  verified: boolean;
}

export const RESTAURANT_INFO = {
  name: "Mehmaan Restaurant",
  urduName: "مہمان ریسٹورنٹ",
  tagline: "True Karachi Hospitality & Sizzling Royal Flavors",
  rating: 4.6,
  reviewCount: 231,
  priceRange: "Rs 1,000–7,000",
  priceReportedCount: 130,
  cuisine: "Pakistani, Charcoal BBQ, Shinwari Karahi, Mughlai Handi & Dum Biryani",
  services: ["Dine-in", "Takeout", "Delivery"],
  address: "Plot no 20 Shop4 alrehman corner D M C H society shaheed e millat, Tariq Rd, opp. traffic choki, Delhi CHS Karachi, 75400, Pakistan",
  shortAddress: "Plot 20, Shop 4, Al-Rehman Corner, DMCHS, Tariq Rd & Shaheed-e-Millat, Karachi",
  plusCode: "V3H8+H5 Delhi CHS, P.E.C.H.S., Karachi, Pakistan",
  phone: "+92 321 2312279",
  phoneFormatted: "+92 321 2312279",
  whatsapp: "+923212312279",
  hours: "Open Daily · Closes 1:00 AM",
  operatingHours: "12:00 PM – 1:00 AM (Monday to Sunday)",
  coordinates: {
    lat: 24.8724,
    lng: 67.0658
  },
  landmarks: [
    "Opposite Traffic Police Choki (Tariq Road)",
    "Adjacent to Al-Rehman Corner DMCHS",
    "2 minutes from Shaheed-e-Millat Expressway",
    "Close to PECHS Block 2 & Bahadurabad"
  ]
};

export const MENU_CATEGORIES = [
  { id: 'all', label: 'Full Menu' },
  { id: 'bbq', label: 'Charcoal BBQ' },
  { id: 'karahi', label: 'Shinwari & Karahi' },
  { id: 'handi', label: 'Clay Pot Handi' },
  { id: 'biryani', label: 'Biryani & Rice' },
  { id: 'tandoor', label: 'Tandoori Naans' },
  { id: 'desserts', label: 'Royal Desserts' },
  { id: 'drinks', label: 'Beverages & Chai' }
] as const;

export const MENU_ITEMS: MenuItem[] = [
  // BBQ
  {
    id: 'bbq-1',
    name: "Mehmaan Royal Sizzler Platter",
    urduName: "مہمان رائل سزلر پلیٹر",
    category: 'bbq',
    description: "Grand assortment of tender Chicken Malai Boti, Beef Bihari Boti, Seekh Kebabs & Fish Tikka on a smoking cast-iron platter with grilled chilies & mint raita.",
    price: 3650,
    popular: true,
    spicyLevel: 2,
    serves: "3–4 Persons",
    image: "/src/assets/images/food_bbq_platter_1793901968953.jpg"
  },
  {
    id: 'bbq-2',
    name: "Chicken Malai Boti (Boneless)",
    urduName: "چکن ملائی بوٹی",
    category: 'bbq',
    description: "Melt-in-your-mouth chicken breast cubes marinated in rich fresh cream, cardamom, mild green chilies, and grilled slow over natural babool coal.",
    price: 1350,
    popular: true,
    spicyLevel: 1,
    serves: "1–2 Persons",
    image: "/src/assets/images/food_bbq_platter_1793901968953.jpg"
  },
  {
    id: 'bbq-3',
    name: "Karachi Beef Bihari Boti",
    urduName: "کراچی بیف بہاری بوٹی",
    category: 'bbq',
    description: "Ultra-tender beef strips tenderized with raw papaya and drenched in aromatic roasted mustard seeds and crushed spices. A true Karachi legend.",
    price: 1450,
    popular: true,
    spicyLevel: 3,
    serves: "1–2 Persons",
    image: "/src/assets/images/food_bbq_platter_1793901968953.jpg"
  },
  {
    id: 'bbq-4',
    name: "Mutton Seekh Kabab (4 Skewers)",
    urduName: "مٹن سیخ کباب",
    category: 'bbq',
    description: "Minced mountain mutton kneaded with fresh herbs, cumin, coriander seeds, and charred over charcoal for juicy interior succulence.",
    price: 1850,
    spicyLevel: 2,
    serves: "2 Persons",
    image: "/src/assets/images/food_bbq_platter_1793901968953.jpg"
  },
  {
    id: 'bbq-5',
    name: "Whole Stuffed Charcoal Chargha",
    urduName: "اسپیشل کوئلہ چڑغہ",
    category: 'bbq',
    description: "Whole tender chicken deep-scored with Lahori red spice masala, steam-roasted, and finished over charcoal coals with chaat masala and lime.",
    price: 2100,
    spicyLevel: 2,
    serves: "3–4 Persons",
    image: "/src/assets/images/food_bbq_platter_1793901968953.jpg"
  },

  // Karahi
  {
    id: 'karahi-1',
    name: "Shinwari Mutton Karahi (Desi Ghee)",
    urduName: "شنواری مٹن کڑاہی",
    category: 'karahi',
    description: "Prepared in traditional iron wok with fresh goat meat, ripe red tomatoes, black pepper, julienned ginger, and green chilies. Cooked in pure desi ghee.",
    price: 3400,
    popular: true,
    spicyLevel: 2,
    serves: "Full (2–3 Persons)",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },
  {
    id: 'karahi-2',
    name: "Peshawari Chicken Karahi",
    urduName: "پشاوری چکن کڑاہی",
    category: 'karahi',
    description: "Authentic Khyber style with tender bone-in chicken, coarse crushed black pepper, sea salt, tomatoes, and sizzling fresh ginger. No onion masala.",
    price: 1950,
    popular: true,
    spicyLevel: 2,
    serves: "Full (2–3 Persons)",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },
  {
    id: 'karahi-3',
    name: "Balochi Sajji Karahi (Boneless)",
    urduName: "بلوچی سجی کڑاہی",
    category: 'karahi',
    description: "Pan-crisped meat tossed in authentic Balochi crushed whole spices, roasted cumin, dried pomegranate seeds (anardana), and lemon juice.",
    price: 2250,
    spicyLevel: 3,
    serves: "2 Persons",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },

  // Handi
  {
    id: 'handi-1',
    name: "Chicken Makhni White Handi (Clay Pot)",
    urduName: "چکن مکھنی وائٹ ہانڈی",
    category: 'handi',
    description: "Boneless chicken simmered gently in traditional unglazed clay handi with dairy cream, cashew paste, white pepper, and a rich butter glaze.",
    price: 2150,
    popular: true,
    spicyLevel: 1,
    serves: "2–3 Persons",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },
  {
    id: 'handi-2',
    name: "Mehmaan Special Paneer Reshmi Handi",
    urduName: "مہمان ریشمی پنیر ہانڈی",
    category: 'handi',
    description: "Velvety Mughlai saffron gravy infused with cottage paneer cubes, roasted fenugreek (kasuri methi), and fresh dairy butter.",
    price: 1750,
    spicyLevel: 1,
    serves: "2 Persons",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },
  {
    id: 'handi-3',
    name: "Mutton Brain Masala (Maghaz)",
    urduName: "مٹن مغز مصالحہ",
    category: 'handi',
    description: "Fresh goat brain braised with browned onions, crushed ginger, chopped green chilies, and garam masala on tawa.",
    price: 1950,
    spicyLevel: 2,
    serves: "1–2 Persons",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },

  // Biryani & Rice
  {
    id: 'rice-1',
    name: "Karachi Special Beef Dum Biryani",
    urduName: "کراچی اسپیشل بیف دم بریانی",
    category: 'biryani',
    description: "Layered aged basmati rice cooked on slow dum with aromatic beef, saffron kewra water, golden plum aloo bukhara, and fragrant mint.",
    price: 1150,
    popular: true,
    spicyLevel: 3,
    serves: "1–2 Persons",
    image: "/src/assets/images/food_karachi_biryani_1793901970187.jpg"
  },
  {
    id: 'rice-2',
    name: "Mehmaan Shahi Mutton Dum Biryani",
    urduName: "مہمان شاہی مٹن دم بریانی",
    category: 'biryani',
    description: "Fragrant long-grain rice with succulent pieces of mutton, golden spiced potatoes, fried golden onions, and saffron essence.",
    price: 1550,
    popular: true,
    spicyLevel: 2,
    serves: "1–2 Persons",
    image: "/src/assets/images/food_karachi_biryani_1793901970187.jpg"
  },
  {
    id: 'rice-3',
    name: "Peshawari Kabuli Pulao",
    urduName: "پشاوری کابلی پلاؤ",
    category: 'biryani',
    description: "Delicately sweetened spiced mutton broth rice topped with caramelized carrots, golden sultana raisins, and toasted almonds.",
    price: 1650,
    spicyLevel: 1,
    serves: "2 Persons",
    image: "/src/assets/images/food_karachi_biryani_1793901970187.jpg"
  },

  // Tandoor
  {
    id: 'bread-1',
    name: "Special Sesame Roghani Naan",
    urduName: "اسپیشل روغنی نان",
    category: 'tandoor',
    description: "Fluffy tandoor-baked leavened bread brushed with pure butter, egg wash, and toasted white & black sesame seeds.",
    price: 160,
    popular: true,
    serves: "1 Person",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },
  {
    id: 'bread-2',
    name: "Garlic Herb Butter Naan",
    urduName: "گارلک بٹر نان",
    category: 'tandoor',
    description: "Hot tandoori naan studded with crushed roasted garlic cloves, fresh coriander, and melted butter.",
    price: 180,
    serves: "1 Person",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },
  {
    id: 'bread-3',
    name: "Stuffed Cheese Kulcha",
    urduName: "اسٹفڈ چیز کلچہ",
    category: 'tandoor',
    description: "Crispy tandoori kulcha packed with molten mozzarella and cheddar cheese infused with green chilies.",
    price: 390,
    serves: "1 Person",
    image: "/src/assets/images/food_karahi_handi_1793901969642.jpg"
  },

  // Desserts
  {
    id: 'dessert-1',
    name: "Zafrani Matka Kheer",
    urduName: "زعفرانی مٹکا کھیر",
    category: 'desserts',
    description: "Slow-reduced milk pudding scented with Kashmiri saffron, crushed green cardamom, pistachios, and silver leaf (varq) in terracotta pot.",
    price: 450,
    popular: true,
    serves: "1 Person",
    image: "/src/assets/images/food_karachi_biryani_1793901970187.jpg"
  },
  {
    id: 'dessert-2',
    name: "Warm Shahi Gulab Jamun (2 pcs)",
    urduName: "شاہی گلاب جامن",
    category: 'desserts',
    description: "Golden khoya dumplings soaked in fragrant rose and cardamom syrup, served piping warm with chopped slivered almonds.",
    price: 350,
    serves: "1–2 Persons",
    image: "/src/assets/images/food_karachi_biryani_1793901970187.jpg"
  },

  // Drinks
  {
    id: 'drink-1',
    name: "Fresh Mint Lemonade Cooler",
    urduName: "فریش منٹ لیمونیڈ",
    category: 'drinks',
    description: "Chilled crushed ice beverage with hand-picked garden mint, fresh Karachi lemons, and black Himalayan rock salt.",
    price: 320,
    popular: true,
    serves: "1 Person",
    image: "/src/assets/images/hero_mehmaan_dining_1793901968860.jpg"
  },
  {
    id: 'drink-2',
    name: "Traditional Kulhad Doodh Patti Chai",
    urduName: "روایتی کلہڑ دودھ پتی",
    category: 'drinks',
    description: "Strong, slow-boiled fresh milk tea brewed with whole green cardamom and served in a warm clay kulhad cup.",
    price: 220,
    popular: true,
    serves: "1 Person",
    image: "/src/assets/images/hero_mehmaan_dining_1793901968860.jpg"
  }
];

export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'rev-1',
    author: "Zubair Hashmi",
    rating: 5,
    date: "1 week ago",
    category: "BBQ",
    comment: "The Chicken Malai Boti and Bihari Kabab are easily among the top 3 in Karachi. Meat is ridiculously soft and seasoned with authentic spices, not overpowered with artificial color. Great family environment right near Tariq Road.",
    highlight: "Top 3 BBQ in Karachi, exceptionally soft meat",
    verified: true
  },
  {
    id: 'rev-2',
    author: "Dr. Farhana Siddiqui",
    rating: 5,
    date: "2 weeks ago",
    category: "Family Dining",
    comment: "We hosted a 14-person family dinner here. The true meaning of Mehmaan (guest) was reflected in their attentive service. The Shinwari Karahi in desi ghee with hot roghani naans was heavenly.",
    highlight: "Attentive hospitality for large family gatherings",
    verified: true
  },
  {
    id: 'rev-3',
    author: "Saad Mansoor",
    rating: 4,
    date: "3 weeks ago",
    category: "Karahi",
    comment: "Ordered takeout on a Friday night. Sizzling mutton karahi was fresh and packed securely in thermal boxes. Price is very reasonable for the portion sizes (around Rs 1800 per person). Highly recommended.",
    highlight: "Fresh, hot takeout with generous portion sizes",
    verified: true
  },
  {
    id: 'rev-4',
    author: "Ayesha Tariq",
    rating: 5,
    date: "a month ago",
    category: "Hospitality",
    comment: "Their White Handi in the clay pot has such a rich, silky texture. Staff was polite and courteous even though it was peak dinner rush past 11 PM. Will definitely return!",
    highlight: "Rich clay pot handi and late night courteous service",
    verified: true
  },
  {
    id: 'rev-5',
    author: "Kamran Sheikh",
    rating: 5,
    date: "2 months ago",
    category: "BBQ",
    comment: "The Sizzler Platter has no equal. Smoke coming out when served at the table creates such an appetite. Also loved their Kulhad chai to finish off the night.",
    highlight: "Grand sizzler platter experience & authentic kulhad chai",
    verified: true
  }
];

export const KARACHI_DELIVERY_ZONES = [
  { name: "PECHS Block 1-6", fee: 100, time: "25–35 mins" },
  { name: "DMCHS & Delhi CHS", fee: 80, time: "20–30 mins" },
  { name: "Tariq Road & Khalid Bin Walid", fee: 90, time: "25–35 mins" },
  { name: "Bahadurabad & CP Berar Society", fee: 120, time: "30–40 mins" },
  { name: "Sindhi Muslim Housing Society (SMCHS)", fee: 120, time: "30–40 mins" },
  { name: "Gulshan-e-Iqbal (Block 13-19)", fee: 180, time: "40–55 mins" },
  { name: "Clifton & DHA Defence", fee: 250, time: "45–60 mins" },
  { name: "Saddar & Garden", fee: 180, time: "35–45 mins" }
];
