# jupyterlab-literallycanvas
[![binder-badge][]][binder]

A JupyterLab MIME renderer/editor for literallycanvas JSON

[binder]: https://mybinder.org/v2/gh/bollwyvl/jupyterlab-literallycanvas/master?urlpath=lab
[binder-badge]: https://mybinder.org/static/images/badge.svg

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab-literallycanvas
```

## Development

For a development install (requires nodejs), do the following in the repository directory:

```bash
jlpm
jlpm build
jlpm ext:link
```

To rebuild the package and the JupyterLab app:

```bash
jlpm build
jupyter lab build
```

To continuously rebuild
```bash
jlpm watch
# in another terminal
jupyter lab build --watch
```
