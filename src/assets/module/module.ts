import { Module, ModuleInitParams } from '../../types/Module';

import wasm from './akhenaten.wasm?url'

import akhenaten from './akhenaten';

export const ModuleInstance = ({ ENV, reportDownloadProgress, pushMessage, canvas }: ModuleInitParams) => {

  let module: Partial<Module>;

  return akhenaten(module = {
    print: msg => module.printErr?.(msg),
    printErr: msg => pushMessage?.(msg),
    canvas,
    preInit: [() => { Object.assign(module?.ENV ?? {}, ENV) }],
    preRun: [],
    noInitialRun: true,
    onExit: code => console.log('exit code: '+code),
    locateFile: (path: string) => {
      if (path.endsWith('wasm')) return wasm;
      throw(`Unknown file[${path}] is requested by akhenaten module; known urls are: ${[wasm]}`);
    },
    setStatus: (status: string | {}) => {
      if (!status) return;
      if (typeof status === 'string') {
        pushMessage(status);
        const dlProgressRE = /(?<progress>\d+)\/(?<total>\d+)/ig;
        if (!dlProgressRE.test(status)) return;
        dlProgressRE.lastIndex = 0;
        const { groups: { progress, total } } = [...status.matchAll(dlProgressRE)][0] as unknown as { groups: { progress: number, total: number } };
        reportDownloadProgress?.(Math.round(progress / total * 100));
      }
    }
  });
}
