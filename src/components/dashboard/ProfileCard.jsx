import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Star,
  User,
  Users,
} from "lucide-react";
import { getUserRatings } from "../../services/api.js";

function StarRating({ averageRating = 0 }) {
  const filled = Math.round(averageRating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= filled ? "fill-orange text-orange" : "text-gray-300"
          }
        />
      ))}
      <span className="ml-1 font-body text-sm text-charcoalMuted">
        ({averageRating.toFixed(1)})
      </span>
    </div>
  );
}

function ProfileCard({ profile, userRole }) {
  const [ratingStats, setRatingStats] = useState(null);

  useEffect(() => {
    if (!profile?._id) return;

    const averageRating = profile.averageRating ?? profile.rating;
    const ratingCount = profile.ratingCount;

    if (averageRating != null && ratingCount != null) {
      setRatingStats({ average: averageRating, count: ratingCount });
      return;
    }

    getUserRatings(profile._id).then((data) => {
      setRatingStats({
        average: data.average || 0,
        count: data.count || 0,
      });
    });
  }, [profile?._id, profile?.averageRating, profile?.ratingCount, profile?.rating]);

  const isViewingWorker = userRole === "employer";
  const isWorkerProfile = profile.role === "worker" || isViewingWorker;

  const averageRating =
    ratingStats?.average ??
    profile.averageRating ??
    profile.rating ??
    0;
  const ratingCount = ratingStats?.count ?? profile.ratingCount ?? 0;

  const infoRows = [
    profile.location?.area && {
      icon: MapPin,
      text: `${profile.location.area}${profile.location.city ? `, ${profile.location.city}` : ""}`,
    },
    profile.time && {
      icon: Clock,
      text: `${isWorkerProfile ? "Available: " : "Required: "}${profile.time}`,
    },
    profile.wages?.min != null &&
      profile.wages?.max != null && {
        icon: IndianRupee,
        text: `${isWorkerProfile ? "Expected: " : "Budget: "}₹${profile.wages.min.toLocaleString("en-IN")} — ₹${profile.wages.max.toLocaleString("en-IN")}/mo`,
      },
    profile.gender && {
      icon: User,
      text: `${isWorkerProfile ? "Gender: " : "Gender preference: "}${profile.gender}`,
    },
    !isWorkerProfile &&
      profile.membersRequired && {
        icon: Users,
        text: `${profile.membersRequired} needed`,
      },
  ].filter(Boolean);

  return (
    <div className="swipe-card flex h-full flex-col overflow-hidden rounded-2xl border border-[#e9ddd1] bg-white shadow-sm">
      <div className="rounded-t-2xl bg-gradient-to-br from-orangeLight to-orange/20 px-6 py-6 text-center">
        <div className="relative mx-auto mb-3 inline-block">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <User size={36} className="text-teal" />
          </div>
          {profile.verified && (
            <CheckCircle2
              size={22}
              className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white text-success"
            />
          )}
        </div>
        <h2 className="font-heading text-xl font-bold text-charcoal">
          {profile.name}
        </h2>
        {profile.category && (
          <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 font-heading text-xs text-orange">
            {profile.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto rounded-b-2xl bg-white px-4 py-2">
        {infoRows.map((row, index) => {
          const Icon = row.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-2 py-2 ${
                index < infoRows.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <Icon size={18} className="shrink-0 text-teal" />
              <span className="font-body text-sm text-charcoalMuted">
                {row.text}
              </span>
            </div>
          );
        })}

        {ratingCount > 0 && (
          <div className="border-b border-gray-100 py-2">
            <StarRating averageRating={averageRating} />
          </div>
        )}

        {isWorkerProfile && profile.experience && (
          <p className="border-b border-gray-100 py-2 font-body text-sm text-charcoalMuted">
            Experience: {profile.experience}
          </p>
        )}

        {profile.about && (
          <p className="py-3 font-body text-sm leading-relaxed text-charcoalMuted">
            {profile.about}
          </p>
        )}

        {profile.languages?.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pb-3 pt-2">
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
    </div>
  );
}

export default ProfileCard;
