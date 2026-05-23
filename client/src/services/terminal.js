import { getInstance } from './webcontainer';

export async function attachShell(term) {
  const wc = await getInstance();
  const shell = await wc.spawn('jsh', {
    terminal: { cols: term.cols, rows: term.rows },
  });

  const writer = shell.input.getWriter();

  shell.output.pipeTo(
    new WritableStream({
      write(chunk) {
        term.write(chunk);
      },
    })
  );

  const dataDisposable = term.onData((data) => {
    writer.write(data);
  });

  const resizeDisposable = term.onResize(({ cols, rows }) => {
    try {
      shell.resize({ cols, rows });
    } catch (_) {}
  });

  return () => {
    try { dataDisposable.dispose(); } catch (_) {}
    try { resizeDisposable.dispose(); } catch (_) {}
    try { writer.releaseLock(); } catch (_) {}
    try { shell.kill(); } catch (_) {}
  };
}
