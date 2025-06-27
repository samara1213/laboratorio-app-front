import { useState, useCallback, useEffect } from 'react';

/**
 * Componente reutilizable para seleccionar menús jerárquicos con checkboxes anidados y lógica padre-hijo.
 * Props:
 * - menus: árbol de menús [{ men_id, men_name, men_parent, children }]
 * - checkedMenus: array de ids seleccionados
 * - setCheckedMenus: setter para los ids seleccionados
 * - expandedMenus: array de ids expandidos (opcional)
 * - setExpandedMenus: setter para los ids expandidos (opcional)
 * - disabled: deshabilitar selección (opcional)
 */
export default function MenuTreeSelector({ menus = [], checkedMenus = [], setCheckedMenus, expandedMenus = [], setExpandedMenus, disabled = false }) {
  // Manejo de checks anidados
  const handleCheck = useCallback((menu, checked) => {
    const collectIds = (node) => [node.men_id, ...(node.children || []).flatMap(collectIds)];
    let newChecked = [...checkedMenus];
    if (checked) {
      newChecked = Array.from(new Set([...newChecked, ...collectIds(menu)]));
      let parentId = typeof menu.men_parent === 'object' ? menu.men_parent?.men_id : menu.men_parent;
      while (parentId) {
        if (!newChecked.includes(parentId)) newChecked.push(parentId);
        const parent = findMenuById(menus, parentId);
        parentId = parent && (typeof parent.men_parent === 'object' ? parent.men_parent?.men_id : parent.men_parent);
      }
    } else {
      const idsToRemove = collectIds(menu);
      newChecked = newChecked.filter(id => !idsToRemove.includes(id));
      let parentId = typeof menu.men_parent === 'object' ? menu.men_parent?.men_id : menu.men_parent;
      while (parentId) {
        const parent = findMenuById(menus, parentId);
        if (parent) {
          const anyChildChecked = (parent.children || []).some(child => newChecked.includes(child.men_id));
          if (!anyChildChecked) {
            newChecked = newChecked.filter(id => id !== parentId);
          }
          parentId = typeof parent.men_parent === 'object' ? parent.men_parent?.men_id : parent.men_parent;
        } else {
          break;
        }
      }
    }
    setCheckedMenus(newChecked);
  }, [checkedMenus, menus, setCheckedMenus]);

  // Expand/collapse
  const handleExpand = (id) => {
    if (!setExpandedMenus) return;
    setExpandedMenus(expandedMenus => expandedMenus.includes(id)
      ? expandedMenus.filter(eid => eid !== id)
      : [...expandedMenus, id]);
  };

  // Buscar menú por id en el árbol
  const findMenuById = (tree, id) => {
    for (const node of tree) {
      if (node.men_id === id) return node;
      if (node.children) {
        const found = findMenuById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Renderizado recursivo de árbol con checkboxes y expand/collapse
  const renderMenuTree = (tree, level = 0) => tree.map(menu => (
    <div key={menu.men_id} className={`pl-${level * 4} flex flex-col`}>
      <div className="flex items-center gap-2">
        {menu.children && menu.children.length > 0 && setExpandedMenus && (
          <button type="button" onClick={() => handleExpand(menu.men_id)} className="focus:outline-none">
            {expandedMenus.includes(menu.men_id) ? '▼' : '▶'}
          </button>
        )}
        <input
          type="checkbox"
          checked={checkedMenus.includes(menu.men_id)}
          onChange={e => handleCheck(menu, e.target.checked)}
          disabled={disabled}
        />
        <span>{menu.men_name}</span>
      </div>
      {menu.children && menu.children.length > 0 && expandedMenus && expandedMenus.includes(menu.men_id) && (
        <div className="pl-4 border-l border-gray-200 ml-2">
          {renderMenuTree(menu.children, level + 1)}
        </div>
      )}
    </div>
  ));

  return (
    <div>
      {menus.length === 0 ? <span className="text-gray-400">No hay menús disponibles</span> : renderMenuTree(menus)}
    </div>
  );
}
