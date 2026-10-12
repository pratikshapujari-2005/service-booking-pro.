export const services = [
  { id: 'home-care', title: 'Home care', price: 799, duration: '60 min' },
  { id: 'wellness', title: 'Wellness', price: 999, duration: '45 min' },
  { id: 'tech-support', title: 'Tech support', price: 599, duration: '30 min' },
  { id: 'personal-care', title: 'Personal care', price: 699, duration: '45 min' },
  { id: 'repairs', title: 'Repairs', price: 499, duration: '30 min' },
  { id: 'learning', title: 'Learning', price: 899, duration: '60 min' },
];
export function findService(id) { return services.find((service) => service.id === id); }
