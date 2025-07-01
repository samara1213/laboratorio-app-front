import LayoutDashboard from '../../dashboard/LayoutDashboard';
import CardWithTitle from '../../CardWithTitle';
import MuiInput from '../../mui/MuiInput';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import MuiSelect from '../../mui/MuiSelect';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { createCustomerDB } from '../../../services';
import { useAuthStore } from '../../../hooks/authStore';


export default function CreateCustomerPage() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { user } = useAuthStore();

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                laboratory: user?.laboratory?.lab_id
            };            
            const response = await createCustomerDB(payload);
            toast.success(response.data.message || 'Cliente creado correctamente');
            reset();
        } catch (error) {
            const msg = error?.response?.data?.message;
            const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al crear el cliente');
            toast.error(errorMsg);
        }
    };

    return (
        <LayoutDashboard>
            <CardWithTitle title="Crear cliente">
                <div className="flex flex-col items-center mb-2">
                    <div className="rounded-full bg-green-100 border-4 border-green-400 shadow-lg w-20 h-20 flex items-center justify-center mb-2 transition-transform duration-300 hover:scale-110 hover:shadow-2xl animate__animated animate__pulse animate__infinite">
                        <Icon icon="mdi:account-plus" className="w-12 h-12 text-green-500" />
                    </div>
                    <span className="text-green-700 font-semibold text-lg">Nuevo cliente</span>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-2 sm:grid-cols-2 max-w-full w-full">
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
                        <CreateButton type="submit" title="Crear" />
                        <CancelButton onClick={() => reset()} />
                    </div>
                </form>
            </CardWithTitle>
        </LayoutDashboard>
    );
}
