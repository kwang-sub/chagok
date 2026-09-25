"""HTTP regression against isolated Next :4318 and oauth-fixture.py :4319.
No real provider credentials; run after starting both local test servers.
"""
import base64
from http.client import HTTPConnection
from http.cookies import SimpleCookie
import json
from urllib.parse import urljoin


def request(path, cookie=""):
    connection = HTTPConnection("127.0.0.1", 4318, timeout=20)
    connection.request("GET", path, headers={"Cookie": cookie, "X-Forwarded-Host": "evil.invalid"})
    response = connection.getresponse()
    result = response.status, {key.lower(): value for key, value in response.getheaders()}, response.read().decode()
    cookies = SimpleCookie()
    for key, value in response.getheaders():
        if key.lower() == "set-cookie":
            cookies.load(value)
    connection.close()
    return result, cookies


def uncached(headers):
    cache = headers.get("cache-control", "")
    assert "private" in cache and "no-store" in cache


def main():
    for path in ["/", "/investments", "/login/private", "/auth/callback/other", "/new-protected-route"]:
        (status, headers, _), _ = request(path + "?next=https://evil.invalid")
        assert status == 307 and urljoin("http://127.0.0.1:4318", headers.get("location", "")) == "http://127.0.0.1:4318/login", path
        uncached(headers)
    for query in ["", "?code=", "?code=%20", "?code=a&code=b", "?error=denied&error_description=private", "?code=no-verifier"]:
        (status, headers, _), _ = request("/auth/callback" + query)
        assert status == 307 and urljoin("http://127.0.0.1:4318", headers.get("location", "")) == "http://127.0.0.1:4318/login?oauth=failed"
        assert headers.get("referrer-policy") == "no-referrer"
        uncached(headers)
    (status, _, html), _ = request("/login?oauth=failed&error_description=private-provider-detail")
    assert status == 200 and 'role="alert"' in html and "Google로 다시 시도" in html
    # Raw search params may exist in RSC data; only the rendered error is generic.
    assert "Google로 계속하기" in html and '<input' not in html

    verifier = "sb-127-auth-token-code-verifier=%22fixture-verifier%22"
    (status, headers, _), cookies = request("/auth/callback?code=fixture-code&next=https://evil.invalid", verifier)
    assert status == 307 and urljoin("http://127.0.0.1:4318", headers.get("location", "")) == "http://127.0.0.1:4318/"
    assert headers.get("referrer-policy") == "no-referrer"
    uncached(headers)
    session = cookies.get("sb-127-auth-token")
    assert session and session.value
    session_cookie = "sb-127-auth-token=" + session.value
    (status, headers, _), _ = request("/investments", session_cookie)
    assert status == 200
    uncached(headers)

    encoded = session.value.removeprefix("base64-")
    data = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
    data["expires_at"] = 1
    expired = "base64-" + base64.urlsafe_b64encode(json.dumps(data).encode()).decode().rstrip("=")
    (status, headers, _), refreshed = request("/investments", "sb-127-auth-token=" + expired)
    assert status == 200 and refreshed.get("sb-127-auth-token")
    uncached(headers)
    print("PASS: protected routes, generic callback failures, SSR session cookies, fixed same-origin redirects, cache/referrer headers, proxy refresh")


if __name__ == "__main__":
    main()
