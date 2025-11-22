/**
 * Footer Component
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-gray-300 mt-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm">
        <p>&copy; {currentYear} LinkProject. All rights reserved.</p>
      </div>
    </footer>
  );
}
