#!/usr/bin/env bash
# Seamless background loop: encode-loop.sh <input> <start> <dur> <outname> [WxH] [crf] [speed]
# Cuts from <start>, scales+crops to fill WxH, crossfades tail into head for a
# seamless loop, strips audio, writes a poster JPG. Output is always <dur> sec.
# <speed> < 1 slows the motion (0.67 = 33% slower) by grabbing less source and
# stretching it across the same <dur> seconds.
set -euo pipefail
IN="$1"; START="$2"; DUR="$3"; NAME="$4"; SIZE="${5:-1920x1080}"; CRF="${6:-25}"; SPEED="${7:-1}"
W="${SIZE%x*}"; H="${SIZE#*x}"; XF=1
OUT="public/assets/video"; mkdir -p "$OUT"
GRAB=$(python3 -c "print(round($DUR*$SPEED,3))")   # source seconds to grab
INV=$(python3 -c "print(round(1/$SPEED,5))")        # setpts stretch factor
SHIFT=$(python3 -c "print(round($DUR-$XF,3))")
ffmpeg -y -loglevel error -ss "$START" -i "$IN" -an -filter_complex \
"[0:v]trim=0:${GRAB},setpts=${INV}*(PTS-STARTPTS),scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p[v0];\
[v0]split[body][head];\
[head]trim=0:${XF},setpts=PTS-STARTPTS,format=yuva420p,fade=t=in:st=0:d=${XF}:alpha=1,setpts=PTS+${SHIFT}/TB[h1];\
[body][h1]overlay=eof_action=pass,format=yuv420p[out]" \
-map "[out]" -c:v libx264 -preset medium -crf "$CRF" -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -y -loglevel error -ss "$(python3 -c "print($START+1)")" -i "$IN" -frames:v 1 \
-vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}" -q:v 4 "$OUT/$NAME.jpg"
echo "$(du -h "$OUT/$NAME.mp4" | cut -f1)  $OUT/$NAME.mp4 (speed ${SPEED})"
