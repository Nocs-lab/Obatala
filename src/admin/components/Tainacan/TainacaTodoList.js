import React, { useState } from 'react';
import { Button, TextControl, TextareaControl, IconButton } from '@wordpress/components';

const TainacanTodoList = () => {
    const [items, setItems] = useState([{ title: '', description: '', image: null }]);

    const handleInputChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        const newItems = [...items];
        newItems[index].image = file;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { title: '', description: '', image: null }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        console.log("Itens para o Tainacan:", items);
    };

    return (
        <div>
            <h2>Cadastro de Itens para Importação no Tainacan</h2>
            {items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                    <TextControl
                        label="Título"
                        value={item.title}
                        onChange={(value) => handleInputChange(index, 'title', value)}
                    />
                    <TextareaControl
                        label="Descrição"
                        value={item.description}
                        onChange={(value) => handleInputChange(index, 'description', value)}
                    />
                    <label>
                        Imagem:
                        <input
                            type="file"
                            onChange={(e) => handleImageChange(index, e)}
                            accept="image/*"
                        />
                    </label>
                    <br />
                    <IconButton
                        icon="trash"
                        label="Remover Item"
                        onClick={() => removeItem(index)}
                        style={{ marginTop: '10px' }}
                    />
                </div>
            ))}
            <Button isSecondary onClick={addItem} style={{ marginTop: '20px' }}>
                Adicionar Novo Item
            </Button>
            <br />
            <Button isPrimary onClick={handleSubmit} style={{ marginTop: '10px' }}>
                Enviar para o Tainacan
            </Button>
        </div>
    );
};

export default TainacanTodoList;
