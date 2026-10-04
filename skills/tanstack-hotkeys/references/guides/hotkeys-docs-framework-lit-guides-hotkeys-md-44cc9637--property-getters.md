# Hotkeys — Property getters

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

## Property getters

`HotkeyController` and `HotkeySequenceController` accept property getters or functions returning options. Controllers read options when the host connects and after each host update, so scoped targets can become available during rendering.

```ts
import { LitElement, html } from 'lit'
import { HotkeyController } from '@tanstack/lit-hotkeys'

export class Editor extends LitElement {
	static properties = { enabled: { type: Boolean } }
	declare enabled: boolean

	constructor() {
		super()
		this.enabled = true
		const component = this
		this.addController(new HotkeyController(this, 'Mod+S', () => console.log('Save'), {
			get enabled() {
				return component.enabled
			},
		}))
	}

	render() {
		return html`<button @click=${() => this.enabled = !this.enabled}>Toggle shortcut</button>`
	}
}
```

You can also pass `() => ({ enabled: this.enabled })`. Use Lit reactive properties, or call `requestUpdate()` after changing plain state. A getter alone does not schedule a host update. Ordinary option changes preserve registration identity. Changing the target moves listeners, and disconnecting releases registrations. For options that depend on the element instance, use a controller rather than decorator configuration created at class definition time.

Recorder controllers accept the same two forms and read them during recording, including active sessions. Callback values remain functions and are not invoked to resolve options.
