// Dimensions du Taj Mahal retenues pour le modèle (1 unité = 1 mètre, y = hauteur au-dessus du jardin).
//
// Sources écrites :
//  - Wikipédia (en), « Taj Mahal » : socle carré de 95,5 m de côté ; mausolée d'environ 57,3 m de côté
//    aux angles chanfreinés ; pishtaq (grand arc) de 33 m ; coupole en bulbe de 23 m sur un tambour de 12 m
//    (diamètre intérieur 18,4 m) ; épi doré de 9,6 m ; hauteur totale 73 m ; minarets de plus de 40 m,
//    en trois parties presque égales séparées par des balcons ; jardin en quatre quarts, bassin central surélevé.
//  - Archnet, site 1557 : chhatris placés en diagonale autour du tambour ; mosquée à l'ouest, jawab à l'est ;
//    minarets à trois balcons coiffés d'un chhatri.
//
// Mesures relevées sur les images de référence (Wikimedia Commons) :
//  - « Section of Taj Mahal (2).jpg » (coupe) : façade haute d'environ 21,5 m au-dessus du socle,
//    chhatris à ~17,5 m de l'axe, bulbe large d'environ 27 m.
//  - « Taj Mahal - South Facade - Agra 2014-05-14 3791.JPG » : pishtaq ~22,6 m de large, arc de 14 m,
//    deux niveaux d'arcs dans chaque travée latérale et sur chaque pan coupé, minarets à ~4,7 m des angles
//    du socle, tambour à peine plus étroit que le bulbe (rapport ~0,9).
//  - « Taj site plan.png » : terrasse côté rivière (~300 x 111 m), jardin carré de ~300 m, porte au sud.
//  - « Jawab at the East of Taj Mahal, Agra.jpg » : bâtiments latéraux en grès rouge, trois coupoles blanches,
//    tours d'angle à chhatri.
//
// Contrôle : 7 (socle) + 21,5 (façade) + 12 (tambour) + 23 (coupole) + 9,6 (épi) = 73,1 m.
export const D = {
  terrace: { w: 300, d: 111, h: 1.2 }, // grès rouge, côté rivière
  plinth: { size: 95.5, top: 7.0 }, // socle de marbre blanc
  body: { half: 28.65, chamfer: 7, height: 21.5, wall: 3 }, // mausolée 57,3 m, pans coupés
  pishtaq: { width: 22.6, height: 26, arch: { w: 14, spring: 11.5 } }, // 26 m + 7 m de socle = 33 m
  drum: { r: 12.2, h: 12 }, // 18,4 m intérieur + murs
  dome: { h: 23, rMax: 13.85 },
  finial: 9.6,
  chhatri: { offset: 17.5 },
  minaret: { offset: 43, height: 40, balconies: [10.5, 21, 31.5] },
  mosque: { x: 128, length: 56, depth: 23, height: 19.6 },
  garden: { size: 300, z0: 55.5 },
  gate: { w: 41, d: 34, h: 23 },
  river: { level: -6 },
};
