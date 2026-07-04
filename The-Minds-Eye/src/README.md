# Source Code

This folder will hold the working code for The Mind's Eye.

## Planned Modules

```text
src/
  portal_api/
    client.py              # Portal to Texas History API client
    search.py              # Search helpers
    ocr.py                 # OCR text retrieval and cleanup
  facts/
    extract.py             # Fact extraction from source text
    classify.py            # verified / inference / gameplay classification
  maps/
    sanborn.py             # Sanborn metadata and location helpers
    locations.py           # numbered playable building index
  missions/
    generate.py            # mission generation pipeline
    validate.py            # source integrity checks
```

## First Coding Target

Create a script that searches the Portal to Texas History API for Texarkana 1885 materials and saves source metadata into `data/raw/`.
