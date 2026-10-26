// Genera src/lib/icons-mdi.json con los íconos mdi que usa el código, para no
// depender de api.iconify.design. Uso: yarn icons (después de agregar un ícono nuevo).
// Los íconos de menú que vengan de la base y no estén aquí se siguen descargando.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { icons } from '@iconify-json/mdi';
import { getIcons } from '@iconify/utils';

// íconos usados en los menús del sistema (men_icon) que no aparecen en el código
const MENU_ICONS = [
  'account-edit-outline', 'account-multiple-outline', 'account-outline', 'account-plus-outline',
  'clipboard-text-outline', 'cog-outline', 'domain', 'file-document-outline', 'format-list-bulleted',
  'handshake-outline', 'home-outline', 'plus-circle-outline', 'shield-account-outline', 'tune-variant',
];

const names = new Set(MENU_ICONS);
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(jsx?|tsx?)$/.test(entry)) {
      for (const [, name] of readFileSync(path, 'utf8').matchAll(/mdi:([a-z0-9-]+)/g)) names.add(name);
    }
  }
};
walk('src');

const subset = getIcons(icons, [...names].sort());
const missing = [...names].filter((n) => !subset?.icons[n] && !subset?.aliases?.[n]);
if (missing.length) throw new Error(`Íconos inexistentes en mdi: ${missing.join(', ')}`);
writeFileSync('src/lib/icons-mdi.json', JSON.stringify(subset));
console.log(`icons-mdi.json: ${names.size} íconos`);
