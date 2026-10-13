#!/usr/bin/env python3
"""Build every web asset derived from the explainer film.

    python3 scripts/build-film-media.py [stills] [ambient] [film]   (default: all)

Input:  media-src/explainer-master.mp4 (the 300 MB master from Dropbox, git-ignored)
Output: public/media/hero-d.{mp4,webm}   ambient hero loop, desktop, 1920x800, no audio
        public/media/hero-m.{mp4,webm}   ambient hero loop, phones, 4:5 reframed, 720x900
        public/media/film-{1080,720}.mp4 the full film with sound and its burned-in captions
        public/media/film-poster.jpg, public/og/default.jpg
        src/assets/img/film/*.jpg        stills for posters and sections (Astro optimises them)
        src/data/film.json               loop duration and the desktop reframing track

The edit itself (shots, framing, stills) lives in scripts/film_plan.py.
"""
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from film_plan import AMBIENT, MASTER, MOBILE_OUT, MOBILE_W, SAFE_H, STILLS, mobile_x  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
FADE = 0.5


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
        check=True, capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def build_stills():
    for name, (t, x, y, w, h, out_w, dest) in STILLS.items():
        os.makedirs(dest, exist_ok=True)
        ff("-ss", f"{t}", "-i", MASTER, "-frames:v", "1",
           "-vf", f"crop={w}:{h}:{x}:{y},scale={out_w}:-2:flags=lanczos", "-q:v", "2",
           f"{dest}/{name}.jpg")
    print("stills:", len(STILLS))


def build_ambient():
    tmp = tempfile.mkdtemp(prefix="ambient-")
    lists = {"d": [], "m": []}
    track, clock = [], 0.0
    for i, (start, end, pct, cx) in enumerate(AMBIENT):
        dur = round(end - start, 3)
        seg_d, seg_m = f"{tmp}/d{i:02d}.mp4", f"{tmp}/m{i:02d}.mp4"
        common = ["-ss", f"{start}", "-t", f"{dur}", "-i", MASTER, "-an", "-c:v", "libx264", "-crf", "10",
                  "-preset", "veryfast", "-pix_fmt", "yuv420p", "-r", "25"]
        ff(*common[:6], "-vf", f"crop=1920:{SAFE_H}:0:0", *common[6:], seg_d)
        ff(*common[:6], "-vf", f"crop={MOBILE_W}:{SAFE_H}:{mobile_x(cx)}:0,"
           f"scale={MOBILE_OUT[0]}:{MOBILE_OUT[1]}:flags=lanczos", *common[6:], seg_m)
        lists["d"].append(seg_d)
        lists["m"].append(seg_m)
        track.append([round(clock, 2), pct])
        clock += dur

    total = round(clock, 2)
    fade = f"fade=t=in:st=0:d={FADE},fade=t=out:st={total - FADE:.2f}:d={FADE}"
    os.makedirs("public/media", exist_ok=True)
    for kind in ("d", "m"):
        concat = f"{tmp}/{kind}.txt"
        with open(concat, "w") as fh:
            fh.writelines(f"file '{p}'\n" for p in lists[kind])
        src = ["-f", "concat", "-safe", "0", "-i", concat, "-vf", fade, "-an"]
        crf_h264, crf_vp9 = ("28", "35") if kind == "d" else ("27", "36")
        ff(*src, "-c:v", "libx264", "-preset", "slower", "-tune", "film", "-crf", crf_h264,
           "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"public/media/hero-{kind}.mp4")
        ff(*src, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", crf_vp9, "-row-mt", "1", "-deadline", "good",
           "-cpu-used", "2", "-pix_fmt", "yuv420p", f"public/media/hero-{kind}.webm")

    data = {}
    if os.path.exists("src/data/film.json"):
        with open("src/data/film.json") as fh:
            data = json.load(fh)
    data["ambient"] = {"duration": total, "desktopTrack": track}
    with open("src/data/film.json", "w") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    print("ambient:", total, "s")


def build_film():
    os.makedirs("public/media", exist_ok=True)
    ff("-i", MASTER, "-c:v", "libx264", "-preset", "slow", "-tune", "film", "-crf", "25",
       "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
       "-movflags", "+faststart", "public/media/film-1080.mp4")
    ff("-i", MASTER, "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-preset", "slow",
       "-tune", "film", "-crf", "26", "-profile:v", "high", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", "public/media/film-720.mp4")
    data = {}
    if os.path.exists("src/data/film.json"):
        with open("src/data/film.json") as fh:
            data = json.load(fh)
    data["film"] = {"duration": round(probe_duration("public/media/film-1080.mp4"), 2)}
    with open("src/data/film.json", "w") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    print("film:", data["film"]["duration"], "s")


if __name__ == "__main__":
    steps = sys.argv[1:] or ["stills", "ambient", "film"]
    for step in steps:
        {"stills": build_stills, "ambient": build_ambient, "film": build_film}[step]()
