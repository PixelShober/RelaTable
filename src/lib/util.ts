export function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface ImageBearer {
	profileImagePath?: string | null;
	profileImageUrl?: string | null;
}

/** Resolve the displayable image src for a person, or null for initials fallback. */
export function personImageSrc(p: ImageBearer): string | null {
	if (p.profileImagePath) return `/uploads/${p.profileImagePath}`;
	const u = p.profileImageUrl;
	// Accept external https URLs *and* already-resolved local paths (e.g. "/uploads/…"),
	// since list/profile loaders pass the resolved src in via profileImageUrl.
	if (u && (/^https:\/\//i.test(u) || u.startsWith('/'))) return u;
	return null;
}
