# Provide Hotkeys And Scopes — Nested scopes win

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Nested scopes win

When several active scopes register the same chord, or a sequence that completes in more than one of them, only the highest-precedence scope runs:

1. A nested scope beats its parent scopes.
2. Among scopes that are not nested, the most recently activated scope wins.

Every matching hotkey in the winning scope runs, and hotkeys in other scopes do not.

```ts
@Component({
  selector: 'app-comment-box',
  providers: [provideHotkeys({ scope: 'comments' })],
  template: `<textarea></textarea>`,
})
export class CommentBox {
  constructor() {
    // Wins while it exists, because 'comments' is nested in 'document'
    injectHotkey('Mod+S', () => this.post())
  }
}

@Component({
  selector: 'app-document',
  providers: [provideHotkeys({ scope: 'document' })],
  imports: [CommentBox],
  template: `<app-comment-box />`,
})
export class DocumentView {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
  }
}
```

When the comment box is destroyed, `Mod+S` saves the document again.

Precedence compares hotkeys on the same [`target`](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md). A hotkey bound to an element still handles events from inside that element before document hotkeys do, as long as its scope is active.

Two registrations of the same hotkey in different scopes are not a conflict, so `conflictBehavior` does not warn about them.
