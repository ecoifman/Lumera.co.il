"""Edit plan for the explainer film (media-src/explainer-master.mp4, 1920x1080, 70.87 s).

The master has Hebrew subtitles burned in at y≈835-895, so every derived picture is cut
from rows 0-800 only. Shot boundaries come from ffmpeg scene detection.
Shared by scripts/build-film-media.py (encoding) and the review sheet.
"""

MASTER = "media-src/explainer-master.mp4"
SAFE_H = 800  # rows above the subtitle band

# Ambient hero loop: (start, end, desktop object-position x %, mobile 4:5 crop centre x px)
AMBIENT = [
    (3.04, 5.00, 65, 1350),    # corridor, a line of light travels in
    (5.00, 6.72, 55, 1170),    # finger on the panel: "בוקר טוב"
    (6.72, 8.60, 75, 1350),    # bedroom wakes up
    (15.24, 16.60, 25, 560),   # pendant lamps
    (16.60, 17.48, 45, 700),   # wine wall, warm light
    (17.48, 18.32, 60, 1300),  # dining pendant, blinds
    (18.32, 19.32, 45, 960),   # kitchen, blinds closing
    (39.28, 40.92, 100, 1350), # touching the central panel
    (40.92, 43.36, 50, 1440),  # four rooms, lights
    (43.36, 45.20, 50, 1150),  # living room in sun
    (45.20, 47.00, 100, 1600), # kids room + panel
    (47.00, 49.40, 100, 1500), # bedroom + panel
    (49.40, 51.80, 100, 1600), # living room + panel
    (51.80, 53.40, 0, 400),    # panel + kitchen
    (55.12, 56.92, 50, 1400),  # night corridor, floor light
    (56.92, 58.12, 50, 900),   # night kitchen
    (59.04, 61.20, 55, 1045),  # couple on the sofa
    (64.88, 66.52, 50, 1280),  # panel with scenes
]

MOBILE_W, MOBILE_OUT = 640, (720, 900)

# Stills: name -> (time, x, y, w, h, out_w, destination)
STILLS = {
    "hero-poster-d": (5.60, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "hero-poster-m": (5.60, 800, 0, 640, 800, 720, "src/assets/img/film"),
    "switch-kids": (45.80, 720, 0, 1200, 800, 1200, "src/assets/img/film"),
    "switch-bedroom": (47.80, 720, 0, 1200, 800, 1200, "src/assets/img/film"),
    "switch-living": (50.00, 720, 0, 1200, 800, 1200, "src/assets/img/film"),
    "switch-kitchen": (52.60, 0, 0, 1200, 800, 1200, "src/assets/img/film"),
    "room-scenes": (65.60, 300, 0, 1164, 800, 1164, "src/assets/img/film"),
    "row-audio": (60.00, 720, 0, 1200, 800, 1200, "src/assets/img/film"),
    "row-security": (33.36, 380, 0, 1200, 800, 1200, "src/assets/img/film"),
    "row-climate": (8.80, 100, 0, 1200, 800, 1200, "src/assets/img/film"),
    "page-switches": (40.00, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-lighting": (17.90, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-audio": (60.00, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-security": (35.30, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-climate": (18.80, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-infrastructure": (4.00, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-professionals": (29.90, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-architects": (49.80, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-developers": (0.40, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "page-electricians": (55.90, 0, 0, 1920, 800, 1920, "src/assets/img/film"),
    "default": (5.60, 338, 0, 1524, 800, 1200, "public/og"),
    "film-poster": (0.40, 0, 0, 1920, 1080, 1280, "public/media"),
}


def mobile_x(cx: int) -> int:
    return max(0, min(1920 - MOBILE_W, cx - MOBILE_W // 2))
