# ego

An opinionated js builder, using `esbuild`. Rebuild on file system changes and livereload is default.

The following structure is needed to yield a build:
- `src/index.jsx`
- `src/index.html`
- a script tag in `src/index.html` referencing `./index.jsx`
- (optional) `static` folder to hold images/etc, (will be copied to the build folder)

Usage for building:
- `ego build`

Usage for dev env:
- `ego --open --port 8080`

Supported flags (configuration):
- `--outdir` - (default: `./dist`) change the build folder
- `--staticdir` - (default: `./static`) change the static folder
- `--public-url` - (default: `/`) change the base url
- `--minify` - (default: `true`) change minification
- `--lint` - (default: `false`) run linting

Build only flags:
- `--analyze` - (default: `false`) show a report of the bundle content

Dev only flags:
- `--port` - (default: `8080`) dev server port
- `--open` - (default: `false`) opening the page in a browser
