# Custom Hotkey Recording — Keys the recorder handles

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-custom-hotkey-recording-md-816282c2.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Keys the recorder handles

| Key | Behavior while recording |
| --- | --- |
| Standalone modifier, such as `Shift` or `Control` | Waits for a non-modifier key |
| Key press (with or without modifiers) | Captures a chord (`Mod+S`, `F1`) |
| `Enter` | Commits a sequence. With `maxSteps: 1` or `commitKeys: 'none'`, records `Enter` instead. |
| `Escape` | Cancels recording and calls `onCancel` |
| `Tab` or `Shift+Tab` (without `Control`, `Alt`, or `Meta`) | Cancels and lets focus move normally. In a text field, `Tab` moves focus without cancelling. Set `recordTab: true` to record `Tab` instead, and show "Press Escape to cancel" for keyboard accessibility. |
| `Backspace` or `Delete` (no modifiers) | Removes the last sequence step, or stops and calls `onClear` when empty |

The recorder also cancels and calls `onCancel` when the window loses focus, such as when the user switches apps or tabs, opens browser devtools, or clicks into an iframe. Set `cancelOnBlur: false` to keep recording. While debugging with devtools open, Chrome's **Rendering > Emulate a focused page** setting keeps the page focused.

A click elsewhere on the page doesn't cancel, because the recorder doesn't know which element is your recorder. To cancel on a click outside it, listen for `pointerdown` while recording. Don't rely on the button's `blur` event: Safari and Firefox on macOS don't focus a button when it is clicked.

```tsx
const ref = useRef<HTMLButtonElement>(null)
useEffect(() => {
  if (!recorder.isRecording) return
  const onPointerDown = (event: PointerEvent) => {
    if (!ref.current?.contains(event.target as Node)) recorder.cancelRecording()
  }
  document.addEventListener('pointerdown', onPointerDown, true)
  return () => document.removeEventListener('pointerdown', onPointerDown, true)
}, [recorder.isRecording, recorder.cancelRecording])

return (
  <button ref={ref} onClick={recorder.startRecording}>
    {recorder.isRecording ? 'Press keys...' : 'Record'}
  </button>
)
```

Shortcuts that the browser or the operating system keeps, such as `Mod+T`, `Mod+N`, and `Mod+W` in Chrome or most `Win` shortcuts on Windows, never reach the page. The recorder can't see them, so it can't reject them either.

Key auto-repeats and IME compositions never add steps. Typing inside other text fields passes through while recording (`Escape` still cancels), unless you pass `ignoreInputs: false` to record inside inputs. Note that `onClear` doesn't delete anything on its own. Decide in your callback whether clearing unbinds the shortcut or resets its default.
