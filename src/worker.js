/* Python runs in a dedicated browser Web Worker. Kill the worker to stop runaway code. */
let python;
const PYODIDE_URL='https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';
async function init(){
  importScripts(PYODIDE_URL+'pyodide.js');
  python=await loadPyodide({indexURL:PYODIDE_URL});
  self.postMessage({type:'ready'});
}
init().catch(error=>self.postMessage({type:'fatal',error:String(error)}));
self.onmessage=async event=>{
  if(event.data.type!=='run'||!python)return;
  const {id,code,expected}=event.data;
  try{
    // Each run uses a fresh Python namespace; only console output is returned.
    python.globals.set('_academy_code',code);
    python.globals.set('_academy_expected',expected ?? '');
    const result=await python.runPythonAsync(`
import io, contextlib, traceback, json
_stream = io.StringIO()
_error = None
_namespace = {'__name__': '__main__'}
try:
    with contextlib.redirect_stdout(_stream), contextlib.redirect_stderr(_stream):
        exec(compile(_academy_code, '<student>', 'exec'), _namespace, _namespace)
except BaseException:
    _error = traceback.format_exc(limit=4)
json.dumps({'output': _stream.getvalue()[:12000], 'error': _error})
`);
    self.postMessage({type:'result',id,...JSON.parse(result)});
  }catch(error){self.postMessage({type:'result',id,output:'',error:String(error)});}
};
