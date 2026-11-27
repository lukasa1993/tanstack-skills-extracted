# Custom Hotkey Recording — Keys the recorder handles

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Keys the recorder handles

| Key | What it does |
| --- | --- |
| A modifier alone, such as Shift | Waits for a key to go with it |
| A key, with or without modifiers | Records a chord, such as `Mod+S` or `F1` |
| Enter | Commits a sequence recording. With `maxSteps: 1` or `commitKeys: 'none'`, records Enter like any other key. |
| Escape | Cancels the recording and calls `onCancel` |
| Tab or Shift+Tab, without Control, Alt, or Meta | Cancels the recording and calls `onCancel`, and the browser moves focus as usual. In a text field, moves focus without cancelling. With `recordTab: true`, records Tab like any other key. |
| Backspace or Delete, without modifiers | Removes the last step. With no steps, stops recording and calls `onClear`. |

The recorder also cancels and calls `onCancel` when the window loses focus, such as when the user switches apps or tabs, opens browser devtools, or clicks into an iframe. Set `cancelOnBlur: false` to keep recording. While debugging with devtools open, Chrome's **Rendering > Emulate a focused page** setting keeps the page focused.

A click elsewhere on the page doesn't cancel, because the recorder doesn't know which element is your recorder. To cancel on a click outside it, listen for `pointerdown` while recording. Check `event.composedPath()`, because the document sees a click inside a shadow root as a click on its host. Don't rely on the button's `blur` event: Safari and Firefox on macOS don't focus a button when it is clicked.

```ts
private onPointerDown = (event: PointerEvent) => {
  if (!event.composedPath().includes(this)) this.recorder.cancelRecording()
}

updated() {
  if (this.recorder.isRecording) {
    document.addEventListener('pointerdown', this.onPointerDown, true)
  } else {
    document.removeEventListener('pointerdown', this.onPointerDown, true)
  }
}

disconnectedCallback() {
  super.disconnectedCallback()
  document.removeEventListener('pointerdown', this.onPointerDown, true)
}
```

Shortcuts that the browser or the operating system keeps, such as `Mod+T`, `Mod+N`, and `Mod+W` in Chrome or most `Win` shortcuts on Windows, never reach the page. The recorder can't see them, so it can't reject them either.

Repeats and IME composition never add a step. `onClear` doesn't change anything on its own, so your app decides whether clearing removes a hotkey or restores its default.

By default, the recorder ignores typing in text fields, so other fields on the page keep working while it listens. Escape still cancels. Set `ignoreInputs: false` to record from inside a text field.

Tab and Shift+Tab end the recording, so keyboard users don't get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). Set `recordTab: true` to let users bind Tab, for example in an editor. Escape still cancels, so show it while recording, such as "Press Escape to cancel".
