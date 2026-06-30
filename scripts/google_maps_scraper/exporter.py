from __future__ import annotations

import csv
from pathlib import Path

from .models import CSV_FIELDS, BusinessResult
from .utils import normalize_url


class CsvExporter:
    def __init__(self, output_path: Path) -> None:
        self.output_path = output_path
        self.seen: set[str] = set()
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.file = self.output_path.open("w", newline="", encoding="utf-8")
        self.writer = csv.DictWriter(self.file, fieldnames=CSV_FIELDS)
        self.writer.writeheader()

    def close(self) -> None:
        self.file.close()

    def dedupe_key(self, result: BusinessResult) -> str:
        url = normalize_url(result.google_maps_url)
        if url:
            return f"url:{url}"
        if result.latitude and result.longitude:
            return f"coords:{result.latitude},{result.longitude}"
        return f"name-address:{result.name.lower()}|{result.address.lower()}"

    def write(self, result: BusinessResult) -> bool:
        key = self.dedupe_key(result)
        if key in self.seen:
            return False

        self.seen.add(key)
        self.writer.writerow(result.to_row())
        self.file.flush()
        return True

    def __enter__(self) -> CsvExporter:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
