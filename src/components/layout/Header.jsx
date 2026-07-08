import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import Button from "../common/Button";
import Logo from "../common/Logo";
import MobileMenu from "./MobileMenu";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9ddd1] bg-warmWhite">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:h-[70px]">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="font-body text-charcoal transition-colors hover:text-orange">
            How it works
          </Link>
          <Link to="/" className="font-body text-charcoal transition-colors hover:text-orange">
            Categories
          </Link>
          <Link to="/" className="font-body text-charcoal transition-colors hover:text-orange">
            Safety
          </Link>
          <Link to="/login">
            <Button variant="outline" className="min-h-[48px] px-5">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="min-h-[48px] px-5">Register</Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-charcoal md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <Menu size={28} />
        </button>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}

export default Header;
