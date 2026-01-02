import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function CreateCategoryForm({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'expense',
        color: '#6B7280',
        icon: 'tag',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <section className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Nova Categoria
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Crie uma nova categoria para organizar suas transações.
            </p>

            <form onSubmit={submit} className="mt-6">
                <div>
                    <InputLabel htmlFor="name" value="Nome" />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="type" value="Tipo" />
                    <select
                        id="type"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                    >
                        <option value="expense">Saída</option>
                        <option value="income">Entrada</option>
                    </select>
                    <InputError message={errors.type} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="color" value="Cor" />
                    <div className="flex items-center mt-1">
                        <input
                            type="color"
                            id="color"
                            className="h-10 w-20 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-1 dark:bg-dark-card"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                        />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">{data.color}</span>
                    </div>
                    <InputError message={errors.color} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-6">
                    <SecondaryButton onClick={onClose}>
                        Cancelar
                    </SecondaryButton>

                    <PrimaryButton className="ml-3" disabled={processing}>
                        Salvar
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
