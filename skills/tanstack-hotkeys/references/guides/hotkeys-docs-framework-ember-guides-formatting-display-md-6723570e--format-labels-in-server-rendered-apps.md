# Formatting Display — Format labels in server-rendered apps

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered in FastBoot uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once the app boots in the browser. To render the right label from the start:

1. Read the request's `User-Agent` header from the `fastboot` service, and pass `detectPlatform(userAgent)` as the `platform` of a `createHotkeysScope` scope.
2. Format labels with `useFormatForDisplay(scope)` instead of `formatForDisplay`. `formatForDisplay` doesn't read the scope, so it ignores the platform from step 1.

Create the scope in a component near the top of your app, such as the one your application template renders:

```gts
// app/components/app-shell.gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { createHotkeysScope, detectPlatform } from '@tanstack/ember-hotkeys'
import Toolbar from './toolbar'

// ember-cli-fastboot doesn't ship types, so declare the part you use
interface FastBootService {
  request: { headers: { get(name: string): string | null } } | null
}

export default class AppShell extends Component {
  @service declare fastboot: FastBootService

  hotkeys = createHotkeysScope({
    platform: detectPlatform(
      this.fastboot.request?.headers.get('user-agent'),
    ),
  })

  <template>
    <Toolbar @hotkeys={{this.hotkeys}} />
  </template>
}
```

```gts
// app/components/toolbar.gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'
import type { EmberHotkeysScope, Hotkey } from '@tanstack/ember-hotkeys'

const commands: Array<{ name: string; hotkey: Hotkey }> = [
  { name: 'Save', hotkey: 'Mod+S' },
  { name: 'Search', hotkey: 'Mod+K' },
]

interface ToolbarSignature {
  Args: { hotkeys: EmberHotkeysScope }
}

export default class Toolbar extends Component<ToolbarSignature> {
  format = useFormatForDisplay(this.args.hotkeys)

  <template>
    <ul>
      {{#each commands as |command|}}
        <li>{{command.name}} <kbd>{{this.format command.hotkey}}</kbd></li>
      {{/each}}
    </ul>
  </template>
}
```

`useFormatForDisplay` returns a function with the same options as `formatForDisplay`, and templates can call it as a helper. It reads the scope's `platform` each time it formats, so labels update when the scope's defaults change. A `platform` passed to the function wins over the scope's. Without a scope, it works like `formatForDisplay`.

In the browser, `fastboot.request` is `null`, so `detectPlatform()` reads the browser's `navigator`. The server and the browser get the same platform for practically every user. The scope's `platform` is also the default platform for the hotkeys and recorders that use the scope. Pass the scope to child components, such as `@hotkeys={{this.hotkeys}}`, so their labels use the same platform.

Without a scope `platform`, `useFormatForDisplay` renders `'linux'` labels in FastBoot. By default, the app replaces the server's HTML when it boots in the browser, so the labels then switch to the browser's platform. Mac users see `Ctrl+S` until the app boots. Set the scope's `platform` to avoid that.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### Render a label only in the browser

To leave a label out of the server's HTML instead, check the `fastboot` service's `isFastBoot`. In the browser, plain `formatForDisplay` detects the platform:

```gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { formatForDisplay } from '@tanstack/ember-hotkeys'

interface FastBootService {
  isFastBoot: boolean
}

export default class SaveShortcut extends Component {
  @service declare fastboot: FastBootService

  <template>
    {{#if this.fastboot.isFastBoot}}
      <kbd>&nbsp;</kbd>
    {{else}}
      <kbd>{{formatForDisplay 'Mod+S'}}</kbd>
    {{/if}}
  </template>
}
```

`isFastBoot` is `true` only while the app renders in FastBoot. A placeholder with the label's width keeps the layout from shifting.

### Static and prerendered pages

Prember renders pages with FastBoot at build time. A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `useFormatForDisplay` can know the platform. The scope recipe above gets `'linux'` there, because the build sends no `User-Agent` header. Render platform-specific labels only in the browser, as above. `useFormatForDisplay` without a scope `platform` also works: it shows `'linux'` labels until the app boots, then switches.

### Development warning

In development, formatting a label in FastBoot without a platform logs a warning once. Without a platform, FastBoot renders `'linux'` labels, so users on macOS and Windows get a different label once the app boots. If you develop on Linux, you won't see the problem yourself. The warning isn't included in production builds.
