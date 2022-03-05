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
- `--public-url` - change the base url from `/` to something like `/myapp/`

Dev only flags:
- `--port` - dev server port
- `--open` - opening the page in a browser

TODO:
- [ ] add a flag to change the build folder
- [ ] add a flag to change the static folder
- [ ] add option to control esbuild minify flag
- [ ] add option to control esbuild bundle flag
- [ ] add an `init` command to create a base file structure
- [ ] consider adding a package to handle `--open` more gracefully (currently only win/osx support)
