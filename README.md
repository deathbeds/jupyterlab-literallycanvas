# jupyterlab-literallycanvas

A JupyterLab MIME renderer for SVG, PNG and literallycanvas JSON

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab-literallycanvas
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```
