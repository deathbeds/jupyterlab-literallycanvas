import {Widget} from '@phosphor/widgets';

/**
 * The default mime type for the extension.
 */
export const MIME_TYPES = ['application/literallycanvas+json'];

/**
 * The class name added to the extension.
 */
export const CLASS_NAME = 'jp-LiterallyCanvas';
export const TOOLBAR_CLASS = `${CLASS_NAME}-Toolbar`;

/**
 * The plugin ids
 */
export const MIME_PLUGIN_ID = '@deathbeds/jupyterlab-literallycanvas:mime';
export const LAUNCHER_PLUGIN_ID = '@deathbeds/jupyterlab-literallycanvas:launcher';

export const TOOL_PREFIX = `${CLASS_NAME}-Tool`;

export const TYPES: {
  [key: string]: {name: string; extensions: string[]};
} = {
  'application/json': {
    name: 'json',
    extensions: ['.json'],
  },
};

export type TColorKind = 'primary' | 'secondary' | 'background';
export const COLOR_KINDS: TColorKind[] = ['primary', 'secondary', 'background'];

export interface ILiterallyCanvas extends Widget {
  undo(): void;
  redo(): void;
  fullscreen(): void;
  setColor(kind: TColorKind, value: string): void;
}

export interface ILiterallyDesktop extends Widget {
  fullscreen(): void;
}

export interface ITool {
  tool?: (LC: any, lc: ILiterallyCanvas) => any;
  action?: (lc: ILiterallyCanvas) => any;
  color?: TColorKind;
}

export const CMD = {
  NEW_DOC: 'docmanager:new-untitled',
  OPEN_DOC: 'docmanager:open',
  NEW_LC: 'literallycanvas:new-untitled',
};
