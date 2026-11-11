// Aplicação de texturas reais com falha isolada por textura (puro, sem DOM — testável em Node).
// Cada alvo é independente: um arquivo ausente, corrompido ou que não seja imagem só afeta o próprio
// corpo; os demais seguem carregando e o corpo com falha mantém a textura procedural.

/**
 * @param {{key: string, file: string, apply: (tex: any) => void}[]} targets
 * @param {{exists: (file: string) => Promise<boolean>, load: (file: string) => Promise<any>}} io
 * @returns {Promise<{loaded: string[], failed: {key: string, error: string}[]}>}
 */
export async function applyTextures(targets, { exists, load }) {
  const results = await Promise.allSettled(targets.map(async (t) => {
    if (!(await exists(t.file))) return null; // ausente: não é erro, continua procedural
    t.apply(await load(t.file));
    return t.key;
  }));
  const loaded = [], failed = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      if (r.value) loaded.push(r.value);
    } else {
      failed.push({ key: targets[i].key, error: r.reason?.message ?? String(r.reason) });
    }
  });
  return { loaded, failed };
}
