# jupyterlab-literallycanvas

[![binder-badge][]][binder]

A JupyterLab MIME renderer/editor for literallycanvas JSON

[binder]: https://mybinder.org/v2/gh/bollwyvl/jupyterlab-literallycanvas/master?urlpath=lab
[binder-badge]: https://mybinder.org/static/images/badge.svg

## Prerequisites

- JupyterLab 0.33
- NodeJS LTS 8

> For example

```bash
conda install -c conda-forge nodejs=8 jupyterlab=0.33
```

## Installation

```bash
jupyter labextension install jupyterlab-literallycanvas --no-build
jupyter lab build --dev
```

## Development

For a development install (requires nodejs), do the following in the repository directory:

```bash
jlpm bootstrap
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
