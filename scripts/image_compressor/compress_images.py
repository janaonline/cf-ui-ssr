import os
import io
import csv
from PIL import Image

input_folder = "images"
output_folder = "compressed"
config_file = "image_config.csv"

# Default dimensions and max file size
DEFAULT_WIDTH = 100
DEFAULT_HEIGHT = 100
DEFAULT_MAX_KB = 100 # You can lower this if needed

os.makedirs(output_folder, exist_ok=True)

# Load CSV config
image_settings = {}
if os.path.exists(config_file):
    with open(config_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            image_settings[row['filename']] = {
                "width": int(row['width']),
                "height": int(row['height']),
                "max_kb": float(row['max_kb']),
            }

def compress_to_target_size(img, output_path, max_size_kb):
    for quality in range(100, 90, -2):
        buffer = io.BytesIO()
        img.save(
            buffer,
            format='webp',
            quality=quality,
            method=6,
            lossless=False if img.mode == "RGB" else True,  # Use lossless if RGBA
            transparency=0 if "A" in img.mode else None
        )
        size_kb = len(buffer.getvalue()) / 1024
        if size_kb <= max_size_kb:
            with open(output_path, 'wb') as f:
                f.write(buffer.getvalue())
            return round(size_kb, 2), quality
    return None, None


# Process each image
for filename in os.listdir(input_folder):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        input_path = os.path.join(input_folder, filename)

        # Load settings from CSV or use default
        settings = image_settings.get(filename, {
            "width": DEFAULT_WIDTH,
            "height": DEFAULT_HEIGHT,
            "max_kb": DEFAULT_MAX_KB
        })

        target_width = settings['width']
        target_height = settings['height']
        max_file_size_kb = settings['max_kb']

        with Image.open(input_path) as img:
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")  # Keep transparency
            else:
                img = img.convert("RGB")   # No transparency to preserve
  # ensure consistent format
            img = img.resize((target_width, target_height), Image.LANCZOS)

            base_name = os.path.splitext(filename)[0]
            output_path = os.path.join(output_folder, f"{base_name}.webp")

            compressed_size_kb, quality_used = compress_to_target_size(img, output_path, max_file_size_kb)
            if compressed_size_kb:
                print(f" {filename} → {base_name}.webp ({target_width}x{target_height}, {compressed_size_kb} KB, quality={quality_used}%)")
            else:
                print(f" {filename} couldn't be compressed under {max_file_size_kb} KB")

print("\n Done!")