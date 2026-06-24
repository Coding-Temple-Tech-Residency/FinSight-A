//FinSight-A/frontend/src/components/Profile/Profile.tsx

import { Profile as ProfileType } from "../../types/profile";

interface ProfileProps {
  profile: ProfileType;
  onClick?: () => void;
}

export default function Profile({
  profile,
  onClick,
}: ProfileProps) {
  const initials = profile.email
    .charAt(0)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="profile"
    >
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt="Profile"
        />
      ) : (
        <div>
          {initials}
        </div>
      )}

      <span>{profile.email}</span>
    </button>
  );
}