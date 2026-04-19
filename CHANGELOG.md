# Changelog

## 0.2.0 — 2026-04-19

### Added

- `onContextMenu` prop — fires on right-click with the move ID, for annotation
  workflows that need to distinguish navigation from selection (#3)
- `--movesheet-font-family` CSS variable (default `inherit`)
- `--movesheet-font-size` CSS variable (default `inherit`)
- `--movesheet-line-height` CSS variable (default `1.6`)
- `--movesheet-comment-display` CSS variable (default `inline`) — set to `block`
  for block-level comments
- `--movesheet-comment-font-style` CSS variable (default `italic`)

### Fixed

- `fontFamily` and `fontSize` were hard-coded inline and couldn't be overridden
  by consumers (#2)
- comment `fontStyle` was hard-coded to `italic` with no override (#4)

## 0.1.2 — 2026-04-09

### Added

- added keywords for npm discoverability

## 0.1.1 — 2026-04-05

- Initial release (re-publish)
