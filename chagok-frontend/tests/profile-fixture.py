"""Local profile test double; no real Google/Supabase verification.

Extends oauth-fixture.py on :4319. Use isolated Next :4318 with the same
public fixture configuration. Name '실패 테스트' simulates a provider failure.
All successful writes are delayed to make pending UI observable.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import runpy
import time

fixture = runpy.run_path(str(Path(__file__).with_name("oauth-fixture.py")))
user = fixture["USER"]
user.update(email="member@example.invalid", user_metadata={"full_name": "테스트 사용자"})


class ProfileHandler(BaseHTTPRequestHandler):
    log_message = fixture["Handler"].log_message
    respond = fixture["Handler"].respond
    do_GET = fixture["Handler"].do_GET
    do_POST = fixture["Handler"].do_POST

    def do_PUT(self):
        if self.path != "/auth/v1/user" or not self.headers.get("Authorization", "").startswith("Bearer "):
            self.respond(401, {"message": "fixture unauthorized"})
            return
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        if set(body) != {"data", "code_challenge", "code_challenge_method"} or set(body["data"]) != {"display_name"}:
            self.respond(400, {"message": "fixture unexpected mutation"})
            return
        assert body["code_challenge"] is None and body["code_challenge_method"] is None
        name = body["data"]["display_name"]
        time.sleep(1)
        if name == "실패 테스트":
            self.respond(500, {"message": "private-provider-detail"})
            return
        user["user_metadata"]["display_name"] = name
        self.respond(200, user)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 4319), ProfileHandler).serve_forever()
