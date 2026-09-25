#!/usr/bin/env bash
# Copies Chromium shared libraries Playwright needs when they are not installed
# system-wide. Does not use sudo. Safe to re-run.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
libdir="$root/.playwright-libs"
marker="$libdir/.ready"

if [[ -f "$marker" ]]; then
  exit 0
fi

missing=()
for pkg in libnspr4 libnss3 libasound2 libasound2-data; do
  if ! dpkg -s "$pkg" >/dev/null 2>&1; then
    missing+=("$pkg")
  fi
done

mkdir -p "$libdir"
if [[ ${#missing[@]} -eq 0 ]]; then
  touch "$marker"
  exit 0
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
(
  cd "$tmpdir"
  apt-get download "${missing[@]}"
  mkdir -p extract
  for deb in ./*.deb; do
    dpkg-deb -x "$deb" extract
  done
  libroot="$(find extract -type d -name '*-linux-gnu' | head -n 1)"
  if [[ -z "$libroot" ]]; then
    echo "No library directory found in downloaded packages" >&2
    exit 1
  fi
  cp -a "$libroot/." "$libdir/"
)
touch "$marker"
