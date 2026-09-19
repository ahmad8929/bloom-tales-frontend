"""Validate raw production HTML and icon bytes: no client JavaScript required."""
import json
import re
import struct
import urllib.request
import urllib.robotparser
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

BASE = 'http://localhost:3100'
DOMAIN = 'https://www.bloomtales.in'
class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(); self.meta = {}; self.links = []; self.buttons = []; self.headings = []; self.h1 = False
        self.feed(html)
        self.data = []
        for script in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
            parsed = json.loads(script)
            self.data.extend(parsed if isinstance(parsed, list) else [parsed])
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta': self.meta.setdefault(attrs.get('name', attrs.get('property')), []).append(attrs.get('content'))
        if tag == 'link': self.links.append(attrs)
        if tag == 'button': self.buttons.append(attrs)
        if tag == 'h1': self.h1 = True
    def handle_endtag(self, tag):
        if tag == 'h1': self.h1 = False
    def handle_data(self, text):
        if self.h1: self.headings.append(text)

def fetch(path, agent='Googlebot'):
    with urllib.request.urlopen(urllib.request.Request(BASE + path, headers={'User-Agent': agent}), timeout=20) as response:
        assert response.status == 200
        return response.read(), response.headers

def page(path):
    return Page(fetch(path)[0].decode())

robot = urllib.robotparser.RobotFileParser(); robot.parse(fetch('/robots.txt')[0].decode().splitlines())
home = page('/')
for rel, size in [('icon', 512), ('apple-touch-icon', 180)]:
    links = [link for link in home.links if link.get('rel') == rel]
    assert len(links) == 1, links
    for path in [links[0]['href'], links[0]['href'].split('?')[0]]:
        content, headers = fetch(path, 'Googlebot-Image')
        assert content[:8] == b'\x89PNG\r\n\x1a\n'
        assert struct.unpack('>II', content[16:24]) == (size, size)
        assert 'image/png' in headers['Content-Type']
        assert 'noindex' not in headers.get('X-Robots-Tag', '')
        assert robot.can_fetch('Googlebot-Image', DOMAIN + path)
assert [item['@type'] for item in home.data] == ['WebSite', 'Organization']
assert home.data[0]['name'] == 'Bloomtales' and home.data[0]['url'] == DOMAIN + '/'
assert home.data[1]['sameAs'] == ['https://www.instagram.com/bloomtales_clothing/']
assert home.meta['og:site_name'] == ['Bloomtales']
urls = [item.text for item in ET.fromstring(fetch('/sitemap.xml')[0]).findall('{*}url/{*}loc')]
products = [url for url in urls if '/products/' in url]
categories = [url for url in urls if '/category/' in url]
assert products and categories
seen_descriptions = set()
seen_titles = set()
variants_tested = 0
for url in [DOMAIN] + categories + products:
    route = url[len(DOMAIN):] or '/'
    parsed = page(route)
    assert [link['href'] for link in parsed.links if link.get('rel') == 'canonical'] == [url]
    for key in ['description', 'og:title', 'og:description', 'og:url', 'og:image', 'og:site_name', 'twitter:title', 'twitter:description', 'twitter:image']:
        assert len(parsed.meta.get(key, [])) == 1 and parsed.meta[key][0], (route, key, parsed.meta.get(key))
    assert parsed.meta['og:url'] == [url]
    assert parsed.meta['og:site_name'] == ['Bloomtales']
    assert parsed.meta['description'][0] not in seen_descriptions, route
    seen_descriptions.add(parsed.meta['description'][0])
    assert parsed.meta['og:title'][0] not in seen_titles, route
    seen_titles.add(parsed.meta['og:title'][0])
    if route.startswith('/products/'):
        types = [item['@type'] for item in parsed.data]
        assert len(types) == 2 and types[-1] == 'BreadcrumbList', (route, types)
        product = parsed.data[0]
        assert product['name'] in ''.join(parsed.headings), (route, parsed.headings)
        variants = product.get('hasVariant', [product])
        for variant in variants:
            assert variant['@type'] == 'Product'
            assert variant['offers']['priceCurrency'] == 'INR'
            assert variant['offers']['price'] >= 0
            assert variant.get('image')
            assert 'review' not in variant and 'aggregateRating' not in variant
        if product['@type'] == 'ProductGroup' and variants_tested < 3:
            variant = variants[-1]
            variant_page = page(variant['url'][len(DOMAIN):])
            assert [link['href'] for link in variant_page.links if link.get('rel') == 'canonical'] == [url]
            assert any(button.get('aria-pressed') == 'true' and button.get('aria-label', '').startswith('Size ' + variant['size']) for button in variant_page.buttons)
            variants_tested += 1
    elif route.startswith('/category/'):
        assert [item['@type'] for item in parsed.data] == ['BreadcrumbList']
print(f'PASS: icons 512/180 square PNG, HTTP 200 and crawlable; homepage WebSite/Organization; complete unique metadata for home + {len(categories)} categories + {len(products)} products; raw-HTML Product/Offer and BreadcrumbList; {variants_tested} size deep links retain canonical and preselect size')
