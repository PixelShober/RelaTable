#!/usr/bin/env python3
"""Fetch the Instagram followees of a logged-in user via instaloader.

Reuses an EXISTING instaloader session (no passwords handled here). Create one
once in a terminal:  instaloader --login=DEIN_IG_NAME
Then this script loads that saved session and lists who you follow.

Usage:  python3 scripts/ig_followings.py <ig_username>
Output: a single JSON object on stdout:
  {"ok": true, "count": N, "followees": [{"username","full_name","profile_pic_url"}]}
  {"ok": false, "error": "..."}
"""
import json
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print(json.dumps({"ok": False, "error": "Usage: ig_followings.py <ig_username>"}))
        return 1
    # instaloader speichert Sessions kleingeschrieben; IG-Usernames sind case-insensitiv.
    username = sys.argv[1].strip().lstrip("@").lower()

    try:
        import instaloader
    except ImportError:
        print(json.dumps({"ok": False, "error": "instaloader nicht installiert (pip install instaloader)"}))
        return 1

    L = instaloader.Instaloader(quiet=True, download_pictures=False)
    try:
        L.load_session_from_file(username)
    except FileNotFoundError:
        print(json.dumps({"ok": False, "error": f"Keine gespeicherte Session für '{username}'. Bitte einmal ausführen: instaloader --login={username}"}))
        return 1
    except Exception as e:  # noqa: BLE001 — surface any login/session error to the UI
        print(json.dumps({"ok": False, "error": f"Session konnte nicht geladen werden: {e}"}))
        return 1

    # Followees über die private App-API (i.instagram.com/api/v1) statt GraphQL — die
    # Web-GraphQL-Query wird von IG aktuell mit 400 geblockt; die App-API ist stabiler.
    import time

    sess = L.context._session
    ds_user_id = sess.cookies.get("ds_user_id")
    if not ds_user_id:
        print(json.dumps({"ok": False, "error": "Kein ds_user_id-Cookie in der Session — bitte neu einloggen"}))
        return 1
    headers = {"User-Agent": "Instagram 219.0.0.12.117 Android", "X-IG-App-ID": "936619743392459"}

    followees = []
    max_id = None
    try:
        while True:
            url = f"https://i.instagram.com/api/v1/friendships/{ds_user_id}/following/?count=200"
            if max_id:
                url += f"&max_id={max_id}"
            r = sess.get(url, headers=headers)
            if r.status_code != 200:
                print(json.dumps({"ok": False, "error": f"API {r.status_code} — evtl. Rate-Limit, später erneut"}))
                return 1
            data = r.json()
            for u in data.get("users", []):
                followees.append({
                    "username": u.get("username", ""),
                    "full_name": u.get("full_name", "") or "",
                    "profile_pic_url": u.get("profile_pic_url", "") or "",
                })
            max_id = data.get("next_max_id")
            if not max_id:
                break
            time.sleep(1)  # ponytail: feste Pause; bei großen Listen ggf. exponentielles Backoff nachrüsten
    except Exception as e:  # noqa: BLE001 — Netzwerk/Blocks landen hier
        print(json.dumps({"ok": False, "error": f"Followings konnten nicht geladen werden: {e}"}))
        return 1

    print(json.dumps({"ok": True, "count": len(followees), "followees": followees}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
