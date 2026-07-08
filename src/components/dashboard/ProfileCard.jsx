import { BadgeCheck, MapPin, Star, User } from "lucide-react";

function ProfileCard({ profile, userRole }) {
  const isViewingWorker = userRole === "employer";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#e9ddd1] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orangeLight">
          <User size={32} className="text-teal" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-heading text-2xl font-bold text-charcoal">
              {profile.name}
            </h2>
            {profile.verified && (
              <BadgeCheck size={20} className="shrink-0 text-teal" />
            )}
          </div>
          <p className="mt-1 font-body text-sm text-charcoalMuted">
            {profile.category}
          </p>
        </div>
      </div>

      {profile.location?.area && (
        <div className="mt-4 flex items-center gap-2 text-charcoalMuted">
          <MapPin size={16} className="shrink-0 text-teal" />
          <span className="font-body text-sm">
            {profile.location.area}
            {profile.location.city ? `, ${profile.location.city}` : ""}
          </span>
        </div>
      )}

      {isViewingWorker && profile.rating > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <Star size={16} className="fill-orange text-orange" />
          <span className="font-body text-sm font-medium text-charcoal">
            {profile.rating.toFixed(1)}
          </span>
          {profile.jobsDone > 0 && (
            <span className="font-body text-sm text-charcoalMuted">
              · {profile.jobsDone} jobs done
            </span>
          )}
        </div>
      )}

      {profile.experience && isViewingWorker && (
        <p className="mt-2 font-body text-sm text-charcoalMuted">
          Experience: {profile.experience}
        </p>
      )}

      {!isViewingWorker && profile.requirement && (
        <p className="mt-3 font-body text-sm text-charcoal">
          {profile.requirement}
        </p>
      )}

      {profile.about && (
        <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-charcoalMuted">
          {profile.about}
        </p>
      )}

      {profile.languages?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-tealLight px-3 py-1 font-body text-xs text-teal"
            >
              {lang}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileCard;
