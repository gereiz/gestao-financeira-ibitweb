import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function Index({ auth, sections }) {
    // Transform sections array into an object keyed by 'key' for easier access in initial state
    const sectionsByKey = sections.reduce((acc, section) => {
        acc[section.key] = section;
        return acc;
    }, {});

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

    const handleFeatureItemChange = (sectionIndex, itemIndex, field, value) => {
        const newSections = [...data.sections];
        const newItems = [...newSections[sectionIndex].content.items];
        newItems[itemIndex] = {
            ...newItems[itemIndex],
            [field]: value
        };
        newSections[sectionIndex].content.items = newItems;
        setData('sections', newSections);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.site.update'));
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
            <div>
                <InputLabel value="Texto do Botão" />
                <TextInput
                    value={section.content.cta_text}
                    onChange={(e) => handleContentChange(index, 'cta_text', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
            <div>
                <InputLabel value="URL da Imagem" />
                <TextInput
                    value={section.content.image_url}
                    onChange={(e) => handleContentChange(index, 'image_url', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
        </div>
    );

    const renderFeaturesForm = (section, index) => (
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
                <h4 className="font-medium text-gray-700">Itens (Features)</h4>
                {section.content.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value={`Título Item ${itemIndex + 1}`} />
                                <TextInput
                                    value={item.title}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'title', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                            <div>
                                <InputLabel value="Ícone (Lucide name)" />
                                <TextInput
                                    value={item.icon}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'icon', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                            <div className="col-span-full">
                                <InputLabel value="Descrição" />
                                <TextInput
                                    value={item.description}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'description', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTestimonialsForm = (section, index) => (
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
                <h4 className="font-medium text-gray-700">Depoimentos</h4>
                {section.content.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Nome" />
                                <TextInput
                                    value={item.name}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'name', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                            <div>
                                <InputLabel value="Cargo/Função" />
                                <TextInput
                                    value={item.role}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'role', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                            <div className="col-span-full">
                                <InputLabel value="Depoimento" />
                                <textarea
                                    value={item.quote}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'quote', e.target.value)}
                                    className="w-full mt-1 border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    rows="2"
                                />
                            </div>
                            <div className="col-span-full">
                                <InputLabel value="URL do Avatar" />
                                <TextInput
                                    value={item.avatar}
                                    onChange={(e) => handleFeatureItemChange(index, itemIndex, 'avatar', e.target.value)}
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCtaFooterForm = (section, index) => (
        <div className="space-y-4">
            <div>
                <InputLabel value="Título" />
                <TextInput
                    value={section.content.title}
                    onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
            <div>
                <InputLabel value="Subtítulo" />
                <TextInput
                    value={section.content.subtitle}
                    onChange={(e) => handleContentChange(index, 'subtitle', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
            <div>
                <InputLabel value="Texto do Botão" />
                <TextInput
                    value={section.content.button_text}
                    onChange={(e) => handleContentChange(index, 'button_text', e.target.value)}
                    className="w-full mt-1"
                />
            </div>
        </div>
    );

    const renderSectionForm = (section, index) => {
        switch (section.key) {
            case 'hero': return renderHeroForm(section, index);
            case 'features': return renderFeaturesForm(section, index);
            case 'testimonials': return renderTestimonialsForm(section, index);
            case 'cta_footer': return renderCtaFooterForm(section, index);
            default: return <div className="text-gray-500">Formulário não disponível para esta seção.</div>;
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Configuração do Site (Landing Page)</h2>}
        >
            <Head title="Configuração do Site" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    {data.sections.map((section) => (
                                        <button
                                            key={section.key}
                                            onClick={() => setActiveTab(section.key)}
                                            className={`${
                                                activeTab === section.key
                                                    ? 'border-primary-500 text-primary-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                        >
                                            {section.key.replace('_', ' ')}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <form onSubmit={submit}>
                                {data.sections.map((section, index) => (
                                    <div key={section.key} className={activeTab === section.key ? 'block' : 'hidden'}>
                                        {renderSectionForm(section, index)}
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
