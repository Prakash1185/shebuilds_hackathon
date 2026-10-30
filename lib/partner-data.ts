export const VENDORS = [
  {
    id: 1,
    name: "Eco Packaging Solutions",
    type: "Supplier",
    category: "Packaging",
    location: "Mumbai",
    distance: "5 km",
    rating: 4.8,
    reviews: 124,
    minOrder: "₹5,000",
    matchScore: 95,
    verified: true,
  },
  {
    id: 2,
    name: "Fresh Ingredients Hub",
    type: "Supplier",
    category: "Raw Materials",
    location: "Mumbai",
    distance: "8 km",
    rating: 4.6,
    reviews: 89,
    minOrder: "₹3,000",
    matchScore: 88,
    verified: true,
  },
  {
    id: 3,
    name: "Digital Marketing Pro",
    type: "Service Provider",
    category: "Marketing",
    location: "Online",
    distance: "Remote",
    rating: 4.9,
    reviews: 156,
    minOrder: "₹10,000",
    matchScore: 92,
    verified: true,
  },
];

export const MENTORS = [
  {
    id: 1,
    name: "Dr. Anjali Mehta",
    expertise: "Business Strategy",
    experience: "15 years",
    language: "Hindi, English",
    sessions: 234,
    rating: 4.9,
    availability: "Available",
    matchScore: 94,
  },
  {
    id: 2,
    name: "Priya Krishnan",
    expertise: "E-commerce",
    experience: "10 years",
    language: "Tamil, English",
    sessions: 189,
    rating: 4.8,
    availability: "Available",
    matchScore: 89,
  },
];

export const PARTNERS = [
  {
    id: 1,
    name: "Sunita Verma",
    business: "Handicraft Store",
    skills: ["Design", "Marketing"],
    looking: "Bulk ordering partner",
    location: "Delhi",
    matchScore: 87,
  },
  {
    id: 2,
    name: "Kavita Singh",
    business: "Food Products",
    skills: ["Cooking", "Packaging"],
    looking: "Distribution partner",
    location: "Mumbai",
    matchScore: 82,
  },
];

export type ProfileType = "vendor" | "mentor" | "partner";


export function getProfile(type: string, id: string | number) {
  const numericId = Number(id);
  const normalizedType = type.trim().toLowerCase();

  if (!Number.isInteger(numericId)) {
    console.error("Invalid profile ID:", id);
    return undefined;
  }

  let profile;

  switch (normalizedType) {
    case "vendor":
      profile = VENDORS.find((item) => item.id === numericId);
      break;

    case "mentor":
      profile = MENTORS.find((item) => item.id === numericId);
      break;

    case "partner":
      profile = PARTNERS.find((item) => item.id === numericId);
      break;

    default:
      console.error("Invalid profile type:", normalizedType);
      return undefined;
  }
  
  return profile;
}