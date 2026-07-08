import { Heart, User, X } from "lucide-react";
import Button from "../common/Button";

function MatchOverlay({ matchData, onClose }) {
  if (!matchData) return null;

  const profile = matchData.matchedProfile;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-warmWhite p-8 text-center shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-charcoalMuted transition-colors hover:bg-orangeLight"
        >
          <X size={20} />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Heart size={36} className="fill-success text-success" />
        </div>

        <h2 className="mt-5 font-heading text-3xl font-bold text-charcoal">
          It&apos;s a match!
        </h2>
        <p className="mt-2 font-body text-charcoalMuted">
          You and {profile?.name} connected
        </p>

        <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-orangeLight">
          <User size={40} className="text-teal" />
        </div>
        <p className="mt-3 font-heading text-xl font-bold text-charcoal">
          {profile?.name}
        </p>
        {profile?.category && (
          <p className="mt-1 font-body text-sm text-charcoalMuted">
            {profile.category}
          </p>
        )}

        <Button className="mt-8 w-full" onClick={onClose}>
          Keep Swiping
        </Button>
      </div>
    </div>
  );
}

export default MatchOverlay;
