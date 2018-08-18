// tslint:disable-next-line
/// <reference path="../node_modules/@types/webpack-env/index.d.ts"/>
import {IRenderMime} from '@jupyterlab/rendermime-interfaces';

import {Toolbar, ToolbarButton} from '@jupyterlab/apputils';

import {Widget, BoxPanel, BoxLayout} from '@phosphor/widgets';
import {Signal} from '@phosphor/signaling';

import {CLASS_NAME, TOOLBAR_CLASS, ITool, TOOL_PREFIX, ILiterallyCanvas, ILiterallyDesktop} from '.';

import * as fscreen from 'fscreen';

import '../style/literallycanvas.css';
import '../style/index.css';

export const DEFAULT_TOOLS: {[key: string]: ITool} = {
  SelectShape: {
    tool: (LC, lc) => new LC.tools.SelectShape(lc),
  },
  Pencil: {
    tool: (LC, lc) => new LC.tools.Pencil(lc),
  },
  Eraser: {
    tool: (LC, lc) => new LC.tools.Eraser(lc),
  },
  Line: {
    tool: (LC, lc) => new LC.tools.Line(lc),
  },
  Ellipse: {
    tool: (LC, lc) => new LC.tools.Ellipse(lc),
  },
  Text: {
    tool: (LC, lc) => new LC.tools.Text(lc),
  },
  Undo: {
    action: (lc) => lc.undo(),
  },
  Redo: {
    action: (lc) => lc.redo(),
  },
  // LC.tools.Polygon,
  // LC.tools.Eyedropper,
  Pan: {
    tool: (LC, lc) => new LC.tools.Pan(lc),
  },
  Fullscreen: {
    action: (lc) => lc.fullscreen(),
  },
};

export class LiterallyCanvas extends Widget implements ILiterallyCanvas {
  private _lc: any;
  private _wrapper: HTMLDivElement;
  private _lastRender: string;
  private _drawingChanged = new Signal<this, void>(this);
  private _LC: any;
  private _tools = new Map<string, any>();
  toolChanged = new Signal<this, string>(this);
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
    this._lc.undo();
  }

  redo() {
    this._lc.redo();
  }

  fullscreen() {
    fscreen.default.requestFullscreen(this.node);
  }

  get drawingChanged() {
    return this._drawingChanged;
  }

  async getCanvas() {
    if (this._lc == null) {
      this._LC = await new Promise((resolve, reject) =>
        require.ensure(
          ['literallycanvas/lib/js/literallycanvas-core'],
          (require) =>
            resolve(require('literallycanvas/lib/js/literallycanvas-core') as any),
          (err: any) => [console.error(err), reject(err)],
          'literallycanvas'
        )
      );
      const lc = this._lc = this._LC.init(this._wrapper);
      lc.setImageSize('infinite', 'infinite');
      // lc.width = lc.height = 'infinite';
      // fix weird no-op
      lc.respondToSizeChange = this._LC.util.matchElementSize(
        this._wrapper, [lc.backgroundCanvas, lc.canvas], lc.backingScale,
        () => {
          lc.keepPanInImageBounds();
          lc.repaintAllLayers();
        }
      );
      lc.on('drawingChange', () => this._drawingChanged.emit(void 0));
      lc.on('toolChange', (tool: any) => this.toolChanged.emit(tool.tool.name));
      this._wrapper.addEventListener('wheel', (evt) => {
        lc.setZoom(lc.scale + (evt.deltaY / -1000));
      });
      lc.respondToSizeChange();
    }

    return this._lc;
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
    canvas.loadSnapshot({...JSON.parse(snapshot), imageSize: null});
  }

  resizeCanvas(): void {
    if (this._lc) {
      this._lc.respondToSizeChange();
    }
  }

  setTool(toolName: string) {
    let tool = this._tools.get(toolName);
    if (tool == null) {
      try {
        tool = DEFAULT_TOOLS[toolName].tool(this._LC, this._lc);
      } catch (err) {
        console.warn(err);
      }
      if (tool != null) {
        this._tools.set(toolName, tool);
      }
    }
    if (tool != null) {
      this._lc.setTool(tool);
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
    this._toolbar.addClass(TOOLBAR_CLASS);

    const layout = this.layout as BoxLayout;
    layout.direction = 'left-to-right';
    layout.spacing = 0;

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
    this._canvas.toolChanged.connect((lc, tool) => {
      this._toolbar.dataset.tool = tool;
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
    this._canvas.resizeCanvas();
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
