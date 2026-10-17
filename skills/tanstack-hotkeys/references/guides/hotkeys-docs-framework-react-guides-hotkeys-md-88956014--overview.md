# Hotkeys — Overview

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

The `useHotkey` hook is the primary way to register keyboard shortcuts in React applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and React ref support.

A hotkey is either a **chord**, keys pressed together such as `'Mod+S'`, or a **sequence**, chords pressed one after another such as `['G', 'G']`. Every API in this guide accepts both. Sequence-specific behavior is covered in the [Sequences Guide](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md). To declare hotkeys up front and let users customize them, see the [App Hotkeys Guide](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md).
