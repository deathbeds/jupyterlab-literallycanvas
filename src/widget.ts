// tslint:disable-next-line
/// <reference path="../node_modules/@types/webpack-env/index.d.ts"/>
import {IRenderMime} from '@jupyterlab/rendermime-interfaces';

import {Toolbar, ToolbarButton} from '@jupyterlab/apputils';

import {Widget, BoxPanel, BoxLayout} from '@phosphor/widgets';
import {Signal} from '@phosphor/signaling';

import {CLASS_NAME, ITool, TOOL_PREFIX, ILiterallyCanvas, ILiterallyDesktop} from '.';

import * as fscreen from 'fscreen';

import '../style/literallycanvas.css';
import '../style/index.css';

export const DEFAULT_TOOLS: {[key: string]: ITool} = {
  select: {
    tool: (LC, lc) => new LC.tools.SelectShape(lc),
  },
  pencil: {
    tool: (LC, lc) => new LC.tools.Pencil(lc),
  },
  eraser: {
    tool: (LC, lc) => new LC.tools.Eraser(lc),
  },
  line: {
    tool: (LC, lc) => new LC.tools.Line(lc),
  },
  ellipse: {
    tool: (LC, lc) => new LC.tools.Ellipse(lc),
  },
  text: {
    tool: (LC, lc) => new LC.tools.Text(lc),
  },
  undo: {
    action: (lc) => lc.undo(),
  },
  redo: {
    action: (lc) => lc.redo(),
  },
  // LC.tools.Polygon,
  // LC.tools.Eyedropper,
  pan: {
    tool: (LC, lc) => new LC.tools.Pan(lc),
  },
  fullscreen: {
    action: (lc) => lc.fullscreen(),
  },
};

export class LiterallyCanvas extends Widget implements ILiterallyCanvas {
  private _canvas: any;
  private _wrapper: HTMLDivElement;
  private _lastRender: string;
  private _drawingChanged = new Signal<this, void>(this);
  private _LC: any;
  private _tools = new Map<string, any>();
  /**
   * Construct a new output widget.
   */
  constructor() {
    super();
    this._wrapper = document.createElement('div');
    this.node.appendChild(this._wrapper);
    this.addClass('jp-LiterallyCanvas');
  }

  undo() {
    this._canvas.undo();
  }

  redo() {
    this._canvas.redo();
  }

  fullscreen() {
    fscreen.default.requestFullscreen(this.node);
  }

  get drawingChanged() {
    return this._drawingChanged;
  }

  async getCanvas() {
    if (this._canvas == null) {
      this._LC = await new Promise((resolve, reject) =>
        require.ensure(
          ['literallycanvas/lib/js/literallycanvas-core'],
          (require) =>
            resolve(require('literallycanvas/lib/js/literallycanvas-core') as any),
          (err: any) => [console.error(err), reject(err)],
          'literallycanvas'
        )
      );
      this._canvas = this._LC.init(this._wrapper, {
        // imageSize: {
        //   width: window.innerWidth,
        //   height: window.innerHeight,
        // },
      });
      this._canvas.on('drawingChange', () => {
        this._drawingChanged.emit(void 0);
      });
    }

    return this._canvas;
  }

  async getSnapshot(): Promise<string> {
    const canvas = await this.getCanvas();
    return JSON.stringify(canvas.getSnapshot());
  }

  async setShapshot(snapshot: string): Promise<void> {
    if (snapshot === this._lastRender) {
      return;
    }
    this._lastRender = snapshot;
    const canvas = await this.getCanvas();
    canvas.loadSnapshot(JSON.parse(snapshot));
  }

  resize(msg: Widget.ResizeMessage): void {
    super.onResize(msg);
    if (this._canvas) {
      this._canvas.backgroundCanvas.width = msg.width;
      this._canvas.backgroundCanvas.height = msg.height;
    }
  }

  setTool(toolName: string) {
    let tool = this._tools.get(toolName);
    if (tool == null) {
      try {
        tool = DEFAULT_TOOLS[toolName].tool(this._LC, this._canvas);
      } catch (err) {
        console.warn(err);
      }
      if (tool != null) {
        this._tools.set(toolName, tool);
      }
    }
    if (tool != null) {
      this._canvas.setTool(tool);
    }
  }
}

/**
 * A widget for rendering LiterallyCanvas.
 */
export class LiterallyDesktop extends BoxPanel
  implements IRenderMime.IRenderer, ILiterallyDesktop {
  private _mimeType: string;
  private _canvas: LiterallyCanvas;
  private _model: IRenderMime.IMimeModel;
  private _toolbar: Toolbar<Widget> = new Toolbar();
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);

    const layout = this.layout as BoxLayout;

    this._canvas = new LiterallyCanvas();
    this._canvas.drawingChanged.connect(async () => {
      if (!this._model) {
        return;
      }
      this._model.setData({
        data: {
          [this._mimeType]: await this._canvas.getSnapshot(),
        },
      });
    });

    this.makeTools();
    BoxLayout.setSizeBasis(this._toolbar, 28);
    BoxLayout.setStretch(this._canvas, 1);
    layout.addWidget(this._toolbar);
    layout.addWidget(this._canvas);
  }

  makeTools() {
    Object.keys(DEFAULT_TOOLS).forEach((toolName) => {
      const tool = DEFAULT_TOOLS[toolName];
      const toolButton = new ToolbarButton({
        className: `${TOOL_PREFIX} ${TOOL_PREFIX}-${toolName}`,
        tooltip: toolName,
        onClick: () => {
          if (DEFAULT_TOOLS[toolName].tool) {
            this._canvas.setTool(toolName);
          } else if (DEFAULT_TOOLS[toolName].action) {
            tool.action(this._canvas);
          } else {
            console.log('unknown tool', tool);
          }
        },
      });
      this._toolbar.addItem(toolName, toolButton);
    });
  }

  fullscreen() {
    fscreen.default.requestFullscreen(this.node);
  }

  protected onResize(msg: Widget.ResizeMessage): void {
    super.onResize(msg);
    this._canvas.resize(msg);
  }

  /**
   * Render LiterallyCanvas into this widget's node.
   */
  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    if (!this._model) {
      this._model = model;
    }
    let shapes = (this._model as any).data[this._mimeType] as string;
    await this._canvas.setShapshot(shapes || '{}');
  }
}
