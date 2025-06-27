import MuiModal from '../../mui/MuiModal';
import MuiInput from '../../mui/MuiInput';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import { useState, useEffect } from 'react';
import CardWithTitle from '../../CardWithTitle';
import { useForm } from 'react-hook-form';
import { getAllMenusDB } from '../../../services/menuService';
import { toast } from 'react-toastify';
import MenuTreeSelector from './MenuTreeSelector';

export default function CreateRoleModal({ open, onSave, onClose, loading = false }) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState([]);
  const [checkedMenus, setCheckedMenus] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [step, setStep] = useState(1);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { rol_nombre: '' }
  });

  useEffect(() => {
    const fetchMenus = async () => {
      if (open) {
        try {
          const res = await getAllMenusDB();
          const menuTree = buildMenuTree(res.data.data || []);
          setMenus(menuTree);
        } catch {
          setMenus([]);
        }
      }
    };
    fetchMenus();
  }, [open]);

  // Función para jerarquizar menús por nivel
  const buildMenuTree = (menus) => {
    const map = {};
    menus.forEach(menu => { map[menu.men_id] = { ...menu, children: [] }; });
    const tree = [];
    menus.forEach(menu => {
      // Asegurarse de que men_parent sea el id, no el objeto
      const parentId = typeof menu.men_parent === 'object' ? menu.men_parent?.men_id : menu.men_parent;
      if (parentId) {
        map[parentId]?.children.push(map[menu.men_id]);
      } else {
        tree.push(map[menu.men_id]);
      }
    });
    return tree;
  };

  const onSubmit = async (data) => {
    setError('');
    setSaving(true);
    try {
      const response = await onSave({ rol_nombre: data.rol_nombre, menus: checkedMenus });
      reset();
      setCheckedMenus([]);
      setExpandedMenus([]);
      onClose();
      toast.success(response?.data?.message || 'Rol creado correctamente');
    } catch (err) {
      setError('Error al crear el rol');
      toast.error(err?.response?.data?.message || 'Error al crear el rol');
    }
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  return (
    <MuiModal open={open} onClose={handleClose} maxWidth="max-w-md">
      <CardWithTitle title="Crear nuevo rol" loading={loading}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 p-2">
          {/* Paso 1: Nombre del rol */}
          {step === 1 && (
            <>
              <MuiInput
                label="Nombre del rol"
                name="rol_nombre"
                {...register('rol_nombre', { required: 'El nombre es obligatorio' })}
                error={error || errors.rol_nombre?.message}
                className="w-full"
              />
              <div className="flex justify-end gap-2">
                <CreateButton type="button" title="Siguiente" onClick={() => setStep(2)} />
              </div>
            </>
          )}
          {/* Paso 2: Menús jerárquicos con checks */}
          {step === 2 && (
            <>
              <label className="block font-semibold mb-2">Permisos de menú</label>
              <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
                <MenuTreeSelector
                  menus={menus}
                  checkedMenus={checkedMenus}
                  setCheckedMenus={setCheckedMenus}
                  expandedMenus={expandedMenus}
                  setExpandedMenus={setExpandedMenus}
                />
              </div>
              <div className="flex justify-between gap-2">
                <CancelButton onClick={() => setStep(1)} title="Regresar" />
                <CreateButton type="submit" title={saving ? 'Guardando...' : 'Crear'} />
              </div>
            </>
          )}
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
