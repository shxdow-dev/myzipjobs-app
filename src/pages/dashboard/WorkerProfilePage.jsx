import { useEffect, useState } from "react";
import { BadgeCheck, MapPin, Star, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageMotion from "../../components/common/PageMotion";
import { useAuth } from "../../context/AuthContext";
import { getUser, getUserRatings } from "../../services/api.js";

function UserProfilePage() {
  const { userId: paramUserId } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const profileUserId = paramUserId || authUser?._id;
  const role = authUser?.role || "worker";
  const isOwnProfile =
    !paramUserId || String(paramUserId) === String(authUser?._id);

  useEffect(() => {
    if (!profileUserId) return;

    const fetchProfile = async () => {
      try {
        const [userData, ratingsData] = await Promise.all([
          getUser(profileUserId),
          getUserRatings(profileUserId),
        ]);

        setProfile(userData);
        setAverageRating(
          ratingsData.average ??
            userData.averageRating ??
            userData.rating ??
            0
        );
        setRatingCount(
          ratingsData.count ?? userData.ratingCount ?? 0
        );
      } catch {
        if (isOwnProfile && authUser) {
          setProfile(authUser);
        }
        setAverageRating(0);
        setRatingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUserId, authUser, isOwnProfile]);

  if (loading) {
    return (
      <div className="py-12 text-center text-charcoalMuted">
        Loading profile...
      </div>
    );
  }

  const data = profile || authUser;
  if (!data) return null;

  const isWorker = data.role === "worker";

  return (
    <PageMotion className="mx-auto max-w-lg pb-24">
      <div className="rounded-2xl border border-orangeLight bg-warmWhite p-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orangeLight">
            <User className="h-10 w-10 text-teal" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-charcoal">
              {data.name}
            </h1>
            {data.verified && <BadgeCheck className="text-teal" size={20} />}
          </div>

          {ratingCount > 0 ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/dashboard/${role}/user/${profileUserId}/reviews`
                )
              }
              className="mt-2 flex cursor-pointer items-center gap-1 font-body text-sm text-charcoalMuted transition hover:text-teal"
            >
              <Star className="h-4 w-4 fill-orange text-orange" />
              <span>{averageRating.toFixed(1)}</span>
              <span>
                ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
              </span>
            </button>
          ) : (
            <span className="mt-2 text-sm text-charcoalMuted">
              No ratings yet
            </span>
          )}

          <span
            className={`mt-2 rounded-full px-3 py-1 text-xs font-medium ${
              isWorker
                ? "bg-tealLight text-teal"
                : "bg-orangeLight text-orange"
            }`}
          >
            {isWorker ? "Worker" : "Employer"}
          </span>
          {data.category && (
            <span className="mt-2 rounded-full bg-tealLight px-3 py-1 text-sm text-teal">
              {data.category}
            </span>
          )}
        </div>

        {data.location?.area && (
          <div className="mt-6 flex items-center gap-2 font-body text-sm text-charcoalMuted">
            <MapPin size={16} className="text-teal" />
            {data.location.area}
            {data.location.city ? `, ${data.location.city}` : ""}
          </div>
        )}

        <div className="mt-6 space-y-3 font-body text-sm">
          {data.time && (
            <p>
              <span className="text-charcoalMuted">Availability: </span>
              <span className="text-charcoal">{data.time}</span>
            </p>
          )}
          {data.wages?.min != null && data.wages?.max != null && (
            <p>
              <span className="text-charcoalMuted">
                {isWorker ? "Expected salary: " : "Budget: "}
              </span>
              <span className="text-charcoal">
                ₹{data.wages.min.toLocaleString("en-IN")} — ₹
                {data.wages.max.toLocaleString("en-IN")}/mo
              </span>
            </p>
          )}
          {data.gender && (
            <p>
              <span className="text-charcoalMuted">Gender: </span>
              <span className="text-charcoal">{data.gender}</span>
            </p>
          )}
          {data.languages?.length > 0 && (
            <p>
              <span className="text-charcoalMuted">Languages: </span>
              <span className="text-charcoal">{data.languages.join(", ")}</span>
            </p>
          )}
          {!isWorker && data.membersRequired && (
            <p>
              <span className="text-charcoalMuted">Workers needed: </span>
              <span className="text-charcoal">{data.membersRequired}</span>
            </p>
          )}
          {data.about && (
            <div className="mt-4 rounded-xl bg-warmWhite p-3">
              <p className="text-charcoalMuted">About</p>
              <p className="mt-1 text-charcoal">{data.about}</p>
            </div>
          )}
        </div>
      </div>
    </PageMotion>
  );
}

export default UserProfilePage;
