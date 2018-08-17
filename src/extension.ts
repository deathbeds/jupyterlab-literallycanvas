import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import {IFileBrowserFactory} from '@jupyterlab/filebrowser';
import {ILauncher} from '@jupyterlab/launcher';

import {LAUNCHER_PLUGIN_ID, CMD} from '.';

const extension: JupyterLabPlugin<void> = {
  id: LAUNCHER_PLUGIN_ID,
  autoStart: true,
  optional: [ILauncher],
  requires: [IFileBrowserFactory],
  activate: (
    app: JupyterLab,
    browserFactory: IFileBrowserFactory,
    launcher?: ILauncher
  ) => {
    const {commands} = app;

    let opts = {type: 'file', ext: '.literallycanvas'};

    // Add a command for creating a new diagram file.
    commands.addCommand(CMD.NEW_LC, {
      label: 'Canvas',
      iconClass: 'jp-MaterialIcon jp-LiterallyCanvasIcon',
      caption: 'Create a new canvas. Literally.',
      execute: async () => {
        let {path} = browserFactory.defaultBrowser.model;
        let model = await commands.execute(CMD.NEW_DOC, {path, ...opts});
        model.content = '{}';
        let res = await commands.execute(CMD.OPEN_DOC, {path: model.path});
        console.log(res);
        return res;
      },
    });

    if (launcher) {
      launcher.add({
        command: CMD.NEW_LC,
        rank: 1,
        category: 'Other',
      });
    }
  },
};

export default extension;
