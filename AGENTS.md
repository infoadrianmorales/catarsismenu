# Project Architecture Rules

- The live `products` and `categories` catalog is the source of truth for both `/` and `/menu`; derive visible menu content and Menu JSON-LD from it to prevent price and description drift.