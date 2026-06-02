from __future__ import annotations

from typing import Final


REQUIRED_LANGUAGES: Final[tuple[str, ...]] = ("en", "zh", "cantonese", "mixed")
REQUIRED_SCENE_TAGS: Final[tuple[str, ...]] = (
    "ktv",
    "car",
    "home_party",
    "warmup",
    "chorus",
    "nostalgic",
    "high_energy",
    "late_night",
)

_TITLE_THEMES: Final[tuple[tuple[str, str], ...]] = (
    ("Neon", "Harbor Circuit"),
    ("Velvet", "Signal Room"),
    ("Lantern", "Cloud Relay"),
    ("Chrome", "Afterglow Lane"),
    ("Amber", "Skyline Drift"),
    ("Crystal", "Night Ledger"),
    ("Solar", "Echo Arcade"),
    ("Violet", "Metro Pulse"),
    ("Silver", "Rain Junction"),
    ("Coral", "Moon Terminal"),
    ("Prism", "Window Route"),
    ("Copper", "Dawn Channel"),
    ("Azure", "Street Lantern"),
    ("Lime", "Stage Current"),
    ("Indigo", "Memory Deck"),
    ("Ruby", "Chorus Engine"),
    ("Pearl", "Road Signal"),
    ("Mint", "House Circuit"),
    ("Saffron", "Late Set"),
    ("Opal", "Warmup Grid"),
    ("Graphite", "City Verse"),
    ("Rose", "Bridge Pattern"),
    ("Cyan", "Table Light"),
    ("Gold", "Final Orbit"),
)

_ARTIST_UNITS: Final[tuple[str, ...]] = (
    "Aster Relay Unit",
    "Signal Vale Collective",
    "Lantern Bay Project",
    "Velvet Grid Assembly",
    "Orbit Room Voices",
    "Moonline Studio Group",
    "Prism Lane Ensemble",
    "Cloudstep Demo Band",
    "Harbor Nine Workshop",
    "Neon Table Society",
    "Skyfield Session Crew",
    "Echo Vale Fictional",
)

_LANGUAGE_GENRES: Final[dict[str, tuple[str, ...]]] = {
    "en": ("karaoke_pop", "synth_pop", "indie_pop", "soft_rock"),
    "zh": ("mandarin_pop", "city_pop", "ballad_pop", "soft_rnb"),
    "cantonese": ("canto_pop", "retro_pop", "soft_rock", "chorus_pop"),
    "mixed": ("fusion_pop", "electro_pop", "roadtrip_pop", "dance_pop"),
}

_LANGUAGE_MOODS: Final[dict[str, tuple[str, ...]]] = {
    "en": ("bright", "uplifting", "night_drive", "easy_open"),
    "zh": ("warm", "nostalgic", "gentle", "group_friendly"),
    "cantonese": ("retro", "late_night", "singalong", "soft_glow"),
    "mixed": ("playful", "high_energy", "spark", "party_ready"),
}

_SCENE_PATTERNS: Final[tuple[tuple[str, ...], ...]] = (
    ("ktv", "warmup", "chorus"),
    ("ktv", "nostalgic", "chorus"),
    ("car", "late_night", "warmup"),
    ("car", "high_energy", "chorus"),
    ("home_party", "high_energy", "chorus"),
    ("home_party", "warmup", "late_night"),
    ("ktv", "home_party", "nostalgic"),
    ("car", "home_party", "high_energy"),
)


def build_demo_songs() -> list[dict]:
    songs: list[dict] = []
    for language_index, language in enumerate(REQUIRED_LANGUAGES):
        genres = _LANGUAGE_GENRES[language]
        moods = _LANGUAGE_MOODS[language]
        for item_index, (prefix, suffix) in enumerate(_TITLE_THEMES, start=1):
            global_index = language_index * len(_TITLE_THEMES) + item_index
            scene_tags = list(_SCENE_PATTERNS[(global_index - 1) % len(_SCENE_PATTERNS)])
            songs.append(
                {
                    "seed_key": f"song-{language}-{item_index:02d}",
                    "title": f"SF Demo {language.upper()} {item_index:02d} {prefix} {suffix}",
                    "artist_name": (
                        f"{_ARTIST_UNITS[(global_index - 1) % len(_ARTIST_UNITS)]} "
                        f"{language.upper()} {item_index:02d}"
                    ),
                    "language": language,
                    "genres": [
                        genres[item_index % len(genres)],
                        genres[(item_index + 1) % len(genres)],
                    ],
                    "moods": [
                        moods[item_index % len(moods)],
                        moods[(item_index + 2) % len(moods)],
                    ],
                    "scene_tags": scene_tags,
                    "energy": round(0.28 + ((global_index % 11) * 0.06), 3),
                    "danceability": round(0.35 + ((global_index % 9) * 0.055), 3),
                    "vocal_difficulty": round(0.22 + ((global_index % 8) * 0.065), 3),
                    "popularity": round(0.42 + ((global_index % 10) * 0.045), 3),
                    "duration_seconds": 185 + ((global_index % 18) * 7),
                    "bpm": 82 + ((global_index * 5) % 58),
                    "release_year": 2024 + (global_index % 2),
                    "cover_visual_seed": f"abstract-{language}-{item_index:02d}-{prefix.lower()}",
                    "source_type": "mock",
                    "rights_status": "demo_safe",
                }
            )
    return songs


DEMO_SONGS: Final[list[dict]] = build_demo_songs()

