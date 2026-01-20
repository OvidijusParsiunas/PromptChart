// Auto navigation shadow toggle for sticky headers
export function readdAutoNavShadowToggle() {
  if (typeof window === 'undefined') return null;

  // Add shadow to navbar on scroll
  const handleScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 10) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  return null;
}
