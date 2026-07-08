import { Link } from "react-router-dom";
import Button from "../common/Button";

function MobileMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="border-b border-[#e9ddd1] bg-warmWhite md:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <Link to="/" className="font-body text-charcoal" onClick={onClose}>
          How it works
        </Link>
        <Link to="/" className="font-body text-charcoal" onClick={onClose}>
          Categories
        </Link>
        <Link to="/" className="font-body text-charcoal" onClick={onClose}>
          Safety
        </Link>
        <div className="flex flex-col gap-3 pt-2">
          <Link to="/login" onClick={onClose}>
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
          <Link to="/register" onClick={onClose}>
            <Button className="w-full">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
