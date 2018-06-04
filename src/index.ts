/**
 * The default mime type for the extension.
 */
export const MIME_TYPES = ['application/literallycanvas+json'];

/**
 * The class name added to the extension.
 */
export const CLASS_NAME = 'jp-OutputWidgetLiterallyCanvas';

/**
 * The plugin id
 */
export const PLUGIN_ID = 'jupyterlab-literallycanvas:plugin';

export const TOOL_PREFIX = 'jp-LiterallyCanvas-Tool';

export const TYPES: {
  [key: string]: {name: string; extensions: string[]};
} = {
  'application/json': {
    name: 'json',
    extensions: ['.json'],
  },
};

export const DEFAULT_TOOLS = {
  pencil: (LC: any, lc: any) => new LC.tools.Pencil(lc),
  eraser: (LC: any, lc: any) => new LC.tools.Eraser(lc),
  line: (LC: any, lc: any) => new LC.tools.Line(lc),
  ellipse: (LC: any, lc: any) => new LC.tools.Ellipse(lc),
  text: (LC: any, lc: any) => new LC.tools.Text(lc),
  // LC.tools.Polygon,
  // LC.tools.Pan,
  // LC.tools.Eyedropper
};
