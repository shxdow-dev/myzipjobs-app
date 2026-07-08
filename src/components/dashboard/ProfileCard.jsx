import {
  BadgeCheck,
  Clock,
  IndianRupee,
  MapPin,
  Star,
  User,
  Users,
} from "lucide-react";

function ProfileCard({ profile, userRole }) {
  const isViewingWorker = userRole === "employer";
  const isWorkerProfile = profile.role === "worker" || isViewingWorker;

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-2xl border border-[#e9ddd1] bg-white p-6 shadow-sm">
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
          {profile.category && (
            <span className="mt-2 inline-block rounded-full bg-tealLight px-3 py-1 font-body text-xs font-medium text-teal">
              {profile.category}
            </span>
          )}
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

      {profile.time && (
        <div className="mt-3 flex items-center gap-2 text-charcoalMuted">
          <Clock size={16} className="shrink-0 text-teal" />
          <span className="font-body text-sm">
            {isWorkerProfile ? "Available: " : "Required: "}
            {profile.time}
          </span>
        </div>
      )}

      {profile.wages?.min != null && profile.wages?.max != null && (
        <div className="mt-3 flex items-center gap-2 text-charcoalMuted">
          <IndianRupee size={16} className="shrink-0 text-teal" />
          <span className="font-body text-sm">
            {isWorkerProfile ? "Expected: " : "Budget: "}
            ₹{profile.wages.min.toLocaleString("en-IN")} — ₹
            {profile.wages.max.toLocaleString("en-IN")}/mo
          </span>
        </div>
      )}

      {profile.gender && (
        <p className="mt-3 font-body text-sm text-charcoalMuted">
          {isWorkerProfile ? "Gender: " : "Gender preference: "}
          {profile.gender}
        </p>
      )}

      {!isWorkerProfile && profile.membersRequired && (
        <div className="mt-3 flex items-center gap-2 text-charcoalMuted">
          <Users size={16} className="shrink-0 text-teal" />
          <span className="font-body text-sm">
            {profile.membersRequired} needed
          </span>
        </div>
      )}

      {isWorkerProfile && profile.rating > 0 && (
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

      {isWorkerProfile && profile.experience && (
        <p className="mt-2 font-body text-sm text-charcoalMuted">
          Experience: {profile.experience}
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
