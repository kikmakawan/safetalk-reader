#!/usr/bin/env python3
"""Regenerate sw.js with the full offline file list. Run from the repo root after any change:
   python3 tools/build_sw.py"""
import os, re, json
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
v = re.search(r'v:\s*"([\d.]+)"', open("version.js", encoding="utf-8").read()).group(1)
core = ["./", "index.html", "manifest.webmanifest"]
core += re.findall(r'(?:src|href)="([^":]+\.(?:js|css))"', open("index.html", encoding="utf-8").read())
files = []
for d in ["icons", "fonts", "img", "pages"]:
    files += sorted(f"{d}/{f}" for f in os.listdir(d) if not f.startswith("."))
assets = list(dict.fromkeys(core + files))
for a in assets:
    if a != "./" and not os.path.exists(a): raise SystemExit(f"missing: {a}")
tpl = open("tools/sw.template.js", encoding="utf-8").read()
out = tpl.replace("__VERSION__", v).replace("__ASSETS__", json.dumps(assets))
open("sw.js", "w", encoding="utf-8").write(out)
print(f"sw.js: version {v}, {len(assets)} files")
