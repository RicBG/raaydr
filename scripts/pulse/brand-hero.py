#!/usr/bin/env python3
"""RAAYDR Pulse hero treatment. Targets measured off the live heroes Aug 2026:
2048x1152, mean luminance 30-38, share under 40 luminance 0.74-0.90,
laplacian grain 22-25. The site paints .grain-overlay at 0.05 opacity on top
at render time, so never bake that tile in here as well."""
import sys
import numpy as np
from PIL import Image, ImageEnhance

TARGET_W, TARGET_H = 2048, 1152
GAMMA = 1.50
BLACK_LIFT = 0.94
SATURATION = 1.06
GRAIN_STD = 8.6
GRAIN_FLOOR = 0.35
SEED = 11


def cover_crop(im, w, h):
    src_ratio, dst_ratio = im.width / im.height, w / h
    if src_ratio > dst_ratio:
        new_w = int(im.height * dst_ratio)
        box = ((im.width - new_w) // 2, 0, (im.width + new_w) // 2, im.height)
    else:
        new_h = int(im.width / dst_ratio)
        box = (0, (im.height - new_h) // 2, im.width, (im.height + new_h) // 2)
    return im.crop(box).resize((w, h), Image.LANCZOS)


def treat(src_path, out_path):
    im = Image.open(src_path).convert("RGB")
    im = cover_crop(im, TARGET_W, TARGET_H)
    im = ImageEnhance.Color(im).enhance(SATURATION)
    a = np.asarray(im).astype(np.float64) / 255.0
    a = np.power(a, GAMMA) * BLACK_LIFT
    lum = a.mean(axis=2, keepdims=True)
    weight = GRAIN_FLOOR + (1.0 - GRAIN_FLOOR) * np.sqrt(np.clip(lum, 0, 1))
    rng = np.random.default_rng(SEED)
    noise = rng.normal(0.0, GRAIN_STD / 255.0, a.shape[:2] + (1,))
    noise = noise + rng.normal(0.0, GRAIN_STD / 255.0 * 0.35, a.shape)
    a = a + noise * weight
    Image.fromarray(np.clip(a * 255.0, 0, 255).astype(np.uint8)).save(
        out_path, quality=92, optimize=True)


def report(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(float)
    g = a.mean(2)
    lap = (g[1:-1, 2:] + g[1:-1, :-2] + g[2:, 1:-1] + g[:-2, 1:-1]
           - 4 * g[1:-1, 1:-1])
    print(f"{path}: mean RGB {a.reshape(-1, 3).mean(0).round(1)}, "
          f"under40 {(g < 40).mean():.3f}, grain {lap.std():.2f}")


if __name__ == "__main__":
    treat(sys.argv[1], sys.argv[2])
    report(sys.argv[2])
