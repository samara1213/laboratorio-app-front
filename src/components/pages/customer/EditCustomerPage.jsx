import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import MuiInput from '../../mui/MuiInput';
import MuiSelect from '../../mui/MuiSelect';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { searchCustomerByDocumentDB, updateCustomerDB } from '../../../services';
import { useAuthStore } from '../../../hooks/authStore';
import { Icon } from '@iconify/react';

export default function EditCustomerPage({ customer, onCancel, loading = false, onSearchDocument }) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: customer });
    const [searchDoc, setSearchDoc] = useState('');
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [foundCustomer, setFoundCustomer] = useState(null);
    const { user } = useAuthStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearching(true);
        const documentNumber = e.target.search_document.value;
        try {
            const res = await searchCustomerByDocumentDB({ laboratory: user?.laboratory?.lab_id, cus_document_number: documentNumber });
            if (res.data) {                
                reset(res.data.data);
                setFoundCustomer(res.data.data);                
                setShowSearch(false);
            }
            if (onSearchDocument) {
                onSearchDocument(res.data);
            }
        } catch (error) {
            const msg = error?.response?.data?.message;
            const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al Buscar cliente');
            toast.error(errorMsg);
        }
        setSearching(false);
    };

    const onSubmit = async (data) => {
        try {
            if (!foundCustomer?.cus_id) {
                toast.error('No se encontró el ID del cliente para actualizar');
                return;
            }
            const payload = {
                cus_document_type: data.cus_document_type,
                cus_document_number: data.cus_document_number,
                cus_first_lastname: data.cus_first_lastname,
                cus_second_lastname: data.cus_second_lastname,
                cus_first_name: data.cus_first_name,
                cus_second_name: data.cus_second_name,
                cus_address: data.cus_address,
                cus_gender: data.cus_gender,
                cus_birthdate: data.cus_birthdate,
                cus_phone: data.cus_phone,
                cus_email: data.cus_email,
                laboratory: user?.laboratory?.lab_id
            }
            const response = await updateCustomerDB(foundCustomer.cus_id, payload);
            toast.success(response.data.message || 'Cliente actualizado correctamente');  
        } catch (error) {
            const msg = error?.response?.data?.message;
            const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al actualizar el cliente');
            toast.error(errorMsg);
        } finally {
            
            setFoundCustomer(null);
            setShowSearch(true);
            reset();
        }
    };

    const handleCancel = () => {
        setFoundCustomer(null);
        setShowSearch(true);
        reset();
        if (onCancel) onCancel();
    };

    return (
        <LayoutDashboard>
            <CardWithTitle title="Editar cliente" loading={loading}>
                {/* Sección de búsqueda por número de documento */}
                {showSearch && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow flex flex-col sm:flex-row items-center gap-2 border border-gray-200">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                        <MuiInput
                            label="Buscar por número de documento"
                            name="search_document"
                            value={searchDoc}
                            onChange={e => setSearchDoc(e.target.value)}
                            className="w-64"
                            required
                        />
                        <div className="mt-4">
                            <CreateButton type="submit" title={searching ? 'Buscando...' : 'Buscar'} disabled={searching} />
                        </div>
                    </form>
                </div>
                )}
                {(foundCustomer && foundCustomer.cus_document_number) && (
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-2 sm:grid-cols-2 max-w-full w-full" style={{ maxHeight: '70vh', overflowY: 'auto' }}>           
                        
                        <MuiSelect
                            label="Tipo de documento"
                            name="cus_document_type"
                            {...register('cus_document_type', { required: 'El tipo de documento es obligatorio' })}
                            error={errors.cus_document_type?.message}
                            className="w-full"
                            defaultValue=""
                        >
                            <option value="">Tipo de documento</option>
                            <option value="RC">Registro civil</option>
                            <option value="CC">Cédula de ciudadanía</option>
                            <option value="CE">Cédula de extranjería</option>
                            <option value="TI">Tarjeta de identidad</option>
                            <option value="PA">Pasaporte</option>
                        </MuiSelect>
                        <MuiInput
                            label="Número de documento"
                            name="cus_document_number"
                            {...register('cus_document_number', { required: 'El número de documento es obligatorio' })}
                            error={errors.cus_document_number?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Primer apellido"
                            name="cus_first_lastname"
                            {...register('cus_first_lastname', { required: 'El primer apellido es obligatorio' })}
                            error={errors.cus_first_lastname?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Segundo apellido"
                            name="cus_second_lastname"
                            {...register('cus_second_lastname')}
                            error={errors.cus_second_lastname?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Primer nombre"
                            name="cus_first_name"
                            {...register('cus_first_name', { required: 'El primer nombre es obligatorio' })}
                            error={errors.cus_first_name?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Segundo nombre"
                            name="cus_second_name"
                            {...register('cus_second_name')}
                            error={errors.cus_second_name?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Dirección"
                            name="cus_address"
                            {...register('cus_address')}
                            error={errors.cus_address?.message}
                            className="w-full"
                        />
                        <MuiSelect
                            label="Género"
                            name="cus_gender"
                            {...register('cus_gender', { required: 'El género es obligatorio' })}
                            error={errors.cus_gender?.message}
                            className="w-full"
                            defaultValue=""
                        >
                            <option value="">Género</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="O">Otro</option>
                        </MuiSelect>
                        <MuiInput
                            label="Fecha de nacimiento"
                            name="cus_birthdate"
                            type="date"
                            {...register('cus_birthdate', { required: 'La fecha de nacimiento es obligatoria' })}
                            error={errors.cus_birthdate?.message}
                            className="w-full border-2 border-green-400 bg-green-50 text-green-900 focus:ring-2 focus:ring-green-400 rounded-lg font-semibold placeholder:text-green-400 hover:border-green-500 transition-all duration-200 shadow-md"
                            style={{ minHeight: 44, letterSpacing: '0.02em', boxShadow: '0 2px 8px 0 #4ade8033' }}
                        />
                        <MuiInput
                            label="Teléfono"
                            name="cus_phone"
                            {...register('cus_phone')}
                            error={errors.cus_phone?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Correo electrónico"
                            name="cus_email"
                            type="email"
                            {...register('cus_email', { required: 'El correo es obligatorio' })}
                            error={errors.cus_email?.message}
                            className="w-full"
                        />
                        <div className="flex justify-end gap-2 sm:col-span-2">
                            <CreateButton type="submit" title="Guardar cambios" />
                            <CancelButton onClick={handleCancel} />
                        </div>
                    </form>
                )}
            </CardWithTitle>
        </LayoutDashboard>
    );
}
