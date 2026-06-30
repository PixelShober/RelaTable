#!/usr/bin/env python3
"""Log in to Instagram via instaloader and save the session for ig_followings.py.

Single-shot login incl. TOTP-2FA: username on argv, password + optional 2FA code
read as JSON from stdin (so the password never appears in the process list).
With an authenticator app the current code is known up front, so login() and
two_factor_login() run in one process — no cross-request state needed.

Usage:  echo '{"password":"…","code":"123456"}' | python3 scripts/ig_login.py <ig_username>
Output: {"ok": true, "username": "…"}  |  {"ok": false, "error": "…"}

ponytail: deckt TOTP-2FA + ohne-2FA ab. SMS-2FA (Code kommt erst NACH login())
braucht einen Zwei-Schritt-Flow — bei Bedarf nachrüsten.
"""
import json
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print(json.dumps({"ok": False, "error": "Usage: ig_login.py <ig_username>"}))
        return 1
    username = sys.argv[1].strip().lstrip("@").lower()

    try:
        creds = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        print(json.dumps({"ok": False, "error": "Ungültige Eingabe"}))
        return 1
    password = creds.get("password") or ""
    code = (creds.get("code") or "").strip()
    if not password:
        print(json.dumps({"ok": False, "error": "Passwort fehlt"}))
        return 1

    try:
        import instaloader
    except ImportError:
        print(json.dumps({"ok": False, "error": "instaloader nicht installiert"}))
        return 1

    L = instaloader.Instaloader(quiet=True)
    try:
        L.login(username, password)
    except instaloader.TwoFactorAuthRequiredException:
        if not code:
            print(json.dumps({"ok": False, "error": "2FA-Code erforderlich — Code aus deiner Authenticator-App eingeben"}))
            return 1
        try:
            L.two_factor_login(code)
        except Exception as e:  # noqa: BLE001 — falscher/abgelaufener Code etc.
            print(json.dumps({"ok": False, "error": f"2FA fehlgeschlagen: {e}"}))
            return 1
    except instaloader.BadCredentialsException:
        print(json.dumps({"ok": False, "error": "Benutzername oder Passwort falsch"}))
        return 1
    except instaloader.ConnectionException as e:
        # Von Server-IPs oft Checkpoint/Challenge — Originalmeldung durchreichen.
        print(json.dumps({"ok": False, "error": f"Login blockiert (evtl. Server-IP-Sperre/Checkpoint): {e}"}))
        return 1
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": f"Login fehlgeschlagen: {e}"}))
        return 1

    try:
        L.save_session_to_file()  # → $XDG_CONFIG_HOME/instaloader/session-<user>
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": f"Session konnte nicht gespeichert werden: {e}"}))
        return 1

    print(json.dumps({"ok": True, "username": L.context.username or username}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
