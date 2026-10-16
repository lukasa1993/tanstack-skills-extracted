# Hotkeys — Overview

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

The `useHotkey` hook is the primary way to register keyboard shortcuts in Preact applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and Preact ref support.

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both. Sequence-specific behavior is covered in the [Sequences Guide](./hotkeys-docs-framework-preact-guides-sequences-md-71b8fd79.md#source-hotkeys-docs-framework-preact-guides-sequences-md). To declare hotkeys up front and let users customize them, see the [App Hotkeys Guide](./hotkeys-docs-framework-preact-guides-app-hotkeys-md-426d55b2.md#source-hotkeys-docs-framework-preact-guides-app-hotkeys-md).
