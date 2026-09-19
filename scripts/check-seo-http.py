"""Run against `npm run start -- --port 3100` after a production build."""
import urllib.request
import xml.etree.ElementTree as ET
import re

base = 'http://localhost:3100'
domain = 'https://www.bloomtales.in'
with urllib.request.urlopen(base + '/sitemap.xml') as response:
    assert response.status == 200 and 'xml' in response.headers['Content-Type']
    root = ET.fromstring(response.read())
urls = [entry.text for entry in root.findall('{*}url/{*}loc')]
assert len(urls) == len(set(urls))
assert all(url.startswith(domain) for url in urls)
assert not any(re.search(r'/(admin|cart|checkout|profile|orders|login|signup|account)(/|$)', url) for url in urls)
with urllib.request.urlopen(base + '/robots.txt') as response:
    assert response.status == 200 and 'text/plain' in response.headers['Content-Type']
    assert 'Sitemap: ' + domain + '/sitemap.xml' in response.read().decode()
for url in urls:
    route = url[len(domain):] or '/'
    html = urllib.request.urlopen(base + route).read().decode()
    canonical = re.findall(r'<link[^>]*rel="canonical"[^>]*href="([^"]+)"', html)
    og = re.findall(r'<meta[^>]*property="og:url"[^>]*content="([^"]+)"', html)
    assert canonical == [url], (route, canonical)
    assert og == [url], (route, og)
    assert 'your-google-verification-code' not in html
print(f'PASS: sitemap/robots HTTP 200; {len(urls)} URLs, each with one self-canonical and matching og:url')
print(f'Products: {sum("/products/" in url for url in urls)}; categories: {sum("/category/" in url for url in urls)}')
for route in ['/cart', '/login', '/signup', '/checkout/payment-success', '/verify-email/test', '/reset-password/test']:
    html = urllib.request.urlopen(base + route).read().decode()
    robots = re.findall(r'<meta name="robots" content="([^"]+)"', html)
    assert robots == ['noindex, nofollow'], (route, robots)
print('PASS: private routes noindex without conflicting robots tags')
