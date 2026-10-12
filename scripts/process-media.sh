#!/usr/bin/env bash
# Encode a source video into the web formats the site uses, plus a poster frame.
#
#   bash scripts/process-media.sh <name> <input.mp4> [start-seconds] [duration-seconds] [poster-second]
#
# Produces:
#   public/media/<name>-1080.mp4   H.264, 1920 wide, no audio, fast start   (desktop)
#   public/media/<name>-1080.webm  VP9,   1920 wide, no audio                (desktop)
#   public/media/<name>-720.mp4    H.264, 1280 wide                          (phones)
#   public/media/<name>-720.webm   VP9,   1280 wide                          (phones)
#   src/assets/img/<name>-poster.jpg  frame used as the poster / LCP image (Astro makes AVIF/WebP)
#
# Background videos are muted, so the audio track is dropped. Originals stay in
# media-src/ (git-ignored); only the encoded files are committed.
set -euo pipefail

name="${1:?name}"
input="${2:?input file}"
start="${3:-0}"
duration="${4:-14}"
poster_at="${5:-1}"

out_media="public/media"
out_img="src/assets/img"
mkdir -p "$out_media" "$out_img"

trim=(-ss "$start" -t "$duration")
common=(-an -pix_fmt yuv420p -movflags +faststart)

# A gentle fade in/out keeps the loop seam invisible.
fade="fade=t=in:st=0:d=0.6,fade=t=out:st=$(awk "BEGIN{print $duration-0.6}"):d=0.6"

ffmpeg -y -loglevel error "${trim[@]}" -i "$input" \
  -vf "scale=1920:-2:flags=lanczos,fps=25,$fade" -c:v libx264 -preset slow -crf 25 -profile:v high "${common[@]}" \
  "$out_media/$name-1080.mp4"

ffmpeg -y -loglevel error "${trim[@]}" -i "$input" \
  -vf "scale=1920:-2:flags=lanczos,fps=25,$fade" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 -an \
  "$out_media/$name-1080.webm"

ffmpeg -y -loglevel error "${trim[@]}" -i "$input" \
  -vf "scale=1280:-2:flags=lanczos,fps=25,$fade" -c:v libx264 -preset slow -crf 27 -profile:v high "${common[@]}" \
  "$out_media/$name-720.mp4"

ffmpeg -y -loglevel error "${trim[@]}" -i "$input" \
  -vf "scale=1280:-2:flags=lanczos,fps=25,$fade" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline good -cpu-used 2 -an \
  "$out_media/$name-720.webm"

ffmpeg -y -loglevel error -ss "$(awk "BEGIN{print $start+$poster_at}")" -i "$input" -frames:v 1 \
  -vf "scale=2560:-2:flags=lanczos" -q:v 2 "$out_img/$name-poster.jpg"

ls -la "$out_media"/"$name"-* "$out_img/$name-poster.jpg"
