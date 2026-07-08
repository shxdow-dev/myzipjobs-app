import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="font-heading text-3xl font-bold leading-none">
      <span className="text-charcoal">my</span>
      <span className="text-orange">Zip</span>
      <span className="text-charcoal">Jobs</span>
    </Link>
  );
}

export default Logo;
