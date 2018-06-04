import {IRenderMime} from '@jupyterlab/rendermime-interfaces';

import {Toolbar, ToolbarButton} from '@jupyterlab/apputils';

import {Widget, BoxPanel, BoxLayout} from '@phosphor/widgets';
import {Signal} from '@phosphor/signaling';

import {CLASS_NAME, DEFAULT_TOOLS, TOOL_PREFIX} from '.';

import '../style/literallycanvas.css';
import '../style/index.css';

export class LiterallyCanvas extends Widget {
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
  }

  get drawingChanged() {
    return this._drawingChanged;
  }


  async getCanvas() {
    if (this._canvas == null) {
      this._LC = (await import('./literallycanvas')) as any;
      this._canvas = this._LC.init(this._wrapper, {
        imageSize: {
          width: 800,
          height: 800,
        }
      });
      this._canvas.on('drawingChange', (evt: any) => {
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

  setTool(toolName: string) {
    let tool = this._tools.get(toolName);
    if (tool == null) {
      try {
        tool = (DEFAULT_TOOLS as any)[toolName](this._LC, this._canvas);
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
export class LiterallyDesktop extends BoxPanel implements IRenderMime.IRenderer {
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
          [this._mimeType]: await this._canvas.getSnapshot()
        }
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
      console.log(toolName);
      const tool = new ToolbarButton({
        className: `${TOOL_PREFIX} ${TOOL_PREFIX}-${toolName}`,
        tooltip: toolName,
        onClick: () => this._canvas.setTool(toolName)
      });
      this._toolbar.addItem(toolName, tool);
    });
  }

  /**
   * Render LiterallyCanvas into this widget's node.
   */
  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    if (!this._model) {
      this._model = model;
    }
    let shapes = (this._model as any).data[this._mimeType] as string;
    await this._canvas.setShapshot(shapes);
  }
}
