import {Widget} from '@phosphor/widgets';

/**
 * The default mime type for the extension.
 */
export const MIME_TYPES = ['application/literallycanvas+json'];

/**
 * The class name added to the extension.
 */
export const CLASS_NAME = 'jp-OutputWidgetLiterallyCanvas';

/**
 * The plugin ids
 */
export const MIME_PLUGIN_ID = 'jupyterlab-literallycanvas:mime';
export const LAUNCHER_PLUGIN_ID = 'jupyterlab-literallycanvas:launcher';

export const TOOL_PREFIX = 'jp-LiterallyCanvas-Tool';

export const TYPES: {
  [key: string]: {name: string; extensions: string[]};
} = {
  'application/json': {
    name: 'json',
    extensions: ['.json'],
  },
};

export interface ILiterallyCanvas extends Widget {
  undo(): void;
  redo(): void;
  fullscreen(): void;
}

export interface ILiterallyDesktop extends Widget {
  fullscreen(): void;
}

export interface ITool {
  tool?: (LC: any, lc: ILiterallyCanvas) => any;
  action?: (lc: ILiterallyCanvas) => any;
}

export const CMD = {
  NEW_DOC: 'docmanager:new-untitled',
  OPEN_DOC: 'docmanager:open',
  NEW_LC: 'literallycanvas:new-untitled',
};
