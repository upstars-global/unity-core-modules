declare global {
  interface Window {
    hj: ((...args: unknown[]) => void) & {q: unknown[]};
    _hjSettings: {
      hjid: string;
      hjsv: number
    };
  }
}

export const HotJar = {
    init(hot_jar_id: string, hot_jar_sv: number) {
        window.hj = window.hj || function(...args: unknown[]) {
            (window.hj.q = window.hj.q || []).push(args);
        };
        window._hjSettings = { hjid: hot_jar_id, hjsv: hot_jar_sv };
        const a = document.getElementsByTagName("head")[0];
        const r = document.createElement("script");
        r.async = true;
        r.src = `https://static.hotjar.com/c/hotjar-${ window._hjSettings.hjid }.js?sv=${ window._hjSettings.hjsv }`;
        a.appendChild(r);
    },
};
