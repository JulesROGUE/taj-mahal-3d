// Points de vue nommés, choisis près des angles des photos de référence (Wikimedia Commons) :
// - facade  : la façade sud depuis le bassin central (« Taj Mahal - South Facade », « Taj Mahal (south view, 2006) »)
// - aerien  : le jardin vu de haut, comme la vue ancienne prise depuis la grande porte (Wellcome V0037711)
// - coupole : la coupole, ses chhatris et les pinacles de près
// - yamuna  : depuis la rivière, au nord (« Taj Mahal at Sunset »)
export const VIEWPOINTS = [
  { id: 'facade', label: 'Façade', position: [0, 2.6, 188], target: [0, 27, 0] },
  { id: 'aerien', label: 'Vue aérienne', position: [250, 205, 430], target: [0, 6, 140] },
  { id: 'coupole', label: 'Coupole', position: [80, 36, 30], target: [0, 40, -2] },
  { id: 'yamuna', label: 'Yamuna', position: [-140, 12, -245], target: [0, 24, 0] },
];

export function viewFromHash(hash) {
  const id = (hash || '').replace(/^#/, '').trim().toLowerCase();
  return VIEWPOINTS.some((v) => v.id === id) ? id : null;
}

export function getViewpoint(id) {
  return VIEWPOINTS.find((v) => v.id === id) || VIEWPOINTS[0];
}
