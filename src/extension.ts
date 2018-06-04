import {IRenderMime} from '@jupyterlab/rendermime-interfaces';

import {MIME_TYPES, PLUGIN_ID} from '.';
import {LiterallyDesktop} from './widget';
/**
 * A mime renderer factory for LiterallyCanvas data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: MIME_TYPES,
  createRenderer: (options) => new LiterallyDesktop(options),
};


const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    id: PLUGIN_ID,
    rendererFactory,
    rank: 0,
    dataType: 'string',
    fileTypes: [{
      name: 'literallycanvas',
      mimeTypes: ['application/literallycanvas+json'],
      extensions: ['.literallycanvas', '.literallycanvas.json'],
    }],
    documentWidgetFactoryOptions: {
      name: 'Canvas (literally)',
      primaryFileType: 'literallycanvas',
      fileTypes: ['literallycanvas', 'json'],
      defaultFor: ['literallycanvas']
    }
  }
];

export default extensions;
