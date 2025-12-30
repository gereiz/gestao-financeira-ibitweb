import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function Index({ auth, sections }) {
    const { data, setData, post, processing, errors } = useForm({
        sections: sections,
    });

    const [activeTab, setActiveTab] = useState('hero');

    const handleContentChange = (index, field, value) => {
        const newSections = [...data.sections];
        newSections[index].content = {
            ...newSections[index].content,
            [field]: value
        };
        setData('sections', newSections);
    };

    const handleFaqItemChange = (sectionIndex, itemIndex, field, value) => {
        const newSections = [...data.sections];
        const newItems = [...newSections[sectionIndex].content.items];
        newItems[itemIndex] = {
            ...newItems[itemIndex],
            [field]: value
        };
        newSections[sectionIndex].content.items = newItems;
        setData('sections', newSections);
    };

    const addFaqItem = (sectionIndex) => {
        const newSections = [...data.sections];
        newSections[sectionIndex].content.items.push({ question: '', answer: '' });
        setData('sections', newSections);
    };

    const removeFaqItem = (sectionIndex, itemIndex) => {
        const newSections = [...data.sections];
        newSections[sectionIndex].content.items.splice(itemIndex, 1);
        setData('sections', newSections);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.plans-page.update'));
    };

    const renderHeroForm = (section, index) => (
        <div className="space-y-4">
            <div>
                <InputLabel value="Título Principal" />
                <TextInput
                    value={section.content.title}
                    onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
            <div>
                <InputLabel value="Subtítulo" />
                <textarea
                    value={section.content.subtitle}
                    onChange={(e) => handleContentChange(index, 'subtitle', e.target.value)}
                    className="w-full mt-1 border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                    rows="3"
                />
            </div>
        </div>
    );

    const renderFaqForm = (section, index) => (
        <div className="space-y-6">
            <div>
                <InputLabel value="Título da Seção" />
                <TextInput
                    value={section.content.title}
                    onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">Perguntas (FAQ)</h4>
                    <button
                        type="button"
                        onClick={() => addFaqItem(index)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        + Adicionar Pergunta
                    </button>
                </div>
                {section.content.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 border rounded-lg bg-gray-50 relative group">
                        <button
                            type="button"
                            onClick={() => removeFaqItem(index, itemIndex)}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Excluir
                        </button>
                        <div className="space-y-4">
                            <div>
                                <InputLabel value={`Pergunta ${itemIndex + 1}`} />
                                <TextInput
                                    value={item.question}
                                    onChange={(e) => handleFaqItemChange(index, itemIndex, 'question', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                            <div>
                                <InputLabel value="Resposta" />
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => handleFaqItemChange(index, itemIndex, 'answer', e.target.value)}
                                    className="w-full mt-1 border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Configurar Página de Planos</h2>}
        >
            <Head title="Página de Planos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex space-x-4 border-b mb-6">
                                {data.sections.map((section) => (
                                    <button
                                        key={section.key}
                                        onClick={() => setActiveTab(section.key)}
                                        className={`pb-2 px-4 font-medium capitalize transition-colors ${
                                            activeTab === section.key
                                                ? 'border-b-2 border-primary-500 text-primary-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {section.key === 'hero' ? 'Cabeçalho' : 'FAQ'}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={submit}>
                                {data.sections.map((section, index) => (
                                    <div key={section.key} className={activeTab === section.key ? 'block' : 'hidden'}>
                                        <div className="mb-6 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`visible-${section.key}`}
                                                checked={section.is_visible}
                                                onChange={(e) => {
                                                    const newSections = [...data.sections];
                                                    newSections[index].is_visible = e.target.checked;
                                                    setData('sections', newSections);
                                                }}
                                                className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                                            />
                                            <label htmlFor={`visible-${section.key}`} className="ml-2 text-sm text-gray-600">
                                                Seção Visível no Site
                                            </label>
                                        </div>

                                        {section.key === 'hero' && renderHeroForm(section, index)}
                                        {section.key === 'faq' && renderFaqForm(section, index)}
                                    </div>
                                ))}

                                <div className="mt-6 flex justify-end">
                                    <PrimaryButton disabled={processing}>
                                        Salvar Alterações
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
