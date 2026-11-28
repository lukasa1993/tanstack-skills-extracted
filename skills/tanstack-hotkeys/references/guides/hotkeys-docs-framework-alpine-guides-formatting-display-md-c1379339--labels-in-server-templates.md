# Formatting Display — Labels in server templates

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Labels in server templates

Alpine runs only in the browser, so labels from `createFormatForDisplay` use the platform detected there. If your server templates, such as Laravel Blade or Rails views, also print shortcut labels, the server doesn't know the platform. Either let Alpine render those labels, such as with `x-text`, or detect the platform from the request's `User-Agent` header with the rules `detectPlatform` uses: `'mac'` if it contains `mac`, `'windows'` if it contains `win`, and `'linux'` otherwise, ignoring case.
