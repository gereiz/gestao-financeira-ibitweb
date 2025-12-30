import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import CreateCategoryForm from './Partials/CreateCategoryForm';

export default function Index({ auth, categories }) {
    const { delete: destroy } = useForm();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            destroy(route('categories.destroy', id));
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Categorias</h2>}
        >
            <Head title="Categorias" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-lg font-medium">Lista de Categorias</h3>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Nova Categoria
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((category) => (
                                <div key={category.id} className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-4"
                                            style={{ backgroundColor: category.color }}
                                        >
                                            {/* Simple Icon placeholder based on name initials */}
                                            {category.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{category.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{category.type === 'income' ? 'Entrada' : 'Saída'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        {(auth.user.is_admin || !category.is_system) && (
                                            <Link href={route('categories.edit', category.id)} className="text-indigo-600 hover:text-indigo-900 mr-2 text-sm">Editar</Link>
                                        )}
                                        {!category.is_system && (
                                            <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900 text-sm">Excluir</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-8">
                                    Nenhuma categoria cadastrada.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showCreateModal} onClose={closeModal}>
                <CreateCategoryForm onClose={closeModal} />
            </Modal>
        </AuthenticatedLayout>
    );
}
