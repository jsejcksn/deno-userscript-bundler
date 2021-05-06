import '../gm.d.ts';
import {findLinks} from './mod.ts';

GM_registerMenuCommand('Get links', () => {
  const links = findLinks();
  const urls = links.map(elm => elm.href);
  console.log(urls);
});
