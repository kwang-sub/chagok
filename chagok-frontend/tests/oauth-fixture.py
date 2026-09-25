"""Local-only OAuth HTTP fixture, not a Google/Supabase smoke test.

Run with python3 tests/oauth-fixture.py. Point the isolated Next runtime at
http://127.0.0.1:4319 with sb_publishable_test; run Next on port 4318.
Never use this fixture outside local tests. No real credentials are accepted.
"""
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time
from urllib.parse import parse_qs, urlparse

USER = {"id": "00000000-0000-4000-8000-000000000001", "aud": "authenticated",
        "app_metadata": {}, "user_metadata": {}, "created_at": "2026-01-01T00:00:00Z"}


def encode(value):
    return base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip("=")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Never log callback codes or session cookies.

    def respond(self, status, payload=None):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        if payload is not None:
            self.wfile.write(json.dumps(payload).encode())

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/auth/v1/authorize":
            params = parse_qs(url.query)
            assert params.get("provider") == ["google"]
            assert params.get("redirect_to") == ["http://127.0.0.1:4318/auth/callback"]
            assert params.get("code_challenge_method") == ["s256"]
            assert params.get("code_challenge")
            self.send_response(302)
            self.send_header("Location", "http://127.0.0.1:4318/auth/callback?code=fixture-code")
            self.end_headers()
        elif url.path == "/auth/v1/user":
            self.respond(200, USER)
        else:
            self.respond(404)

    def do_POST(self):
        url = urlparse(self.path)
        if url.path == "/auth/v1/logout":
            assert parse_qs(url.query).get("scope") == ["local"]
            self.respond(204)
            return
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or "{}")
        assert url.path == "/auth/v1/token"
        grant = parse_qs(url.query).get("grant_type")
        assert grant in (["pkce"], ["refresh_token"])
        if grant == ["pkce"]:
            assert body.get("auth_code") == "fixture-code"
            assert body.get("code_verifier")
        token = ".".join([encode({"alg": "HS256", "typ": "JWT"}),
                          encode({"sub": USER["id"], "exp": int(time.time()) + 3600}), "fixture-signature"])
        self.respond(200, {"access_token": token, "refresh_token": "fixture-refresh",
                           "expires_in": 3600, "token_type": "bearer", "user": USER})


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 4319), Handler).serve_forever()
