/* Loads the drawings, then the viewer. Which drawings: ?scene=a,b (names in scenes/, or paths ending in .js), else
   everything listed in scenes/manifest.js. The viewer to start is the data-viewer attribute of this script tag. */
(function () {
  const me = document.currentScript, viewer = me.dataset.viewer, qs = new URLSearchParams(location.search);
  const pick = qs.get('scene'), files = (pick ? pick.split(',') : window.SCENE_FILES || []).map(n => /\.js$/.test(n) ? n : 'scenes/' + n + '.js');
  const load = (src, then) => { const s = document.createElement('script'); s.src = src; s.onload = then; s.onerror = () => { console.error('could not load ' + src); then(); }; document.body.appendChild(s); };
  let i = 0; const next = () => i < files.length ? load(files[i++], next) : load(viewer, () => { });
  next();
})();
