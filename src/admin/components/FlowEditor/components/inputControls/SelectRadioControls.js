import {
    Button,
    CheckboxControl,
    RadioControl,
    SelectControl,
    TextControl,
} from "@wordpress/components";
import HelpTextControl from "./HelpTextControl";
import FieldNameControl from "./FieldNameControl";
import React, { useState } from "react";
import { __ } from "@wordpress/i18n";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";
import { useDrawer } from "../../context/DrawerContext";

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
    label: Yup.string().required(__('The label is required', 'obatala')),
    options: Yup.string().required(__('The options are required', 'obatala')),
    required: Yup.boolean(),
    helpText: Yup.string(),
});

export const SelectRadioControls = ({
    nodeId,
    fieldId,
    label,
    options,
    required,
    helpText,
    config,
    isSelect, // Recebendo a configuração do campo
    tainacanMappingControls,
}) => {
    const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
    const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
    const { toggleDrawer } = useDrawer();  

    const [formValues, setFormValues] = useState({
        label: config ? config.label : label ? label : "",
        options: config ? config.options : options ? options : "",
        required: config ? config.required : false,
        helpText: config ? config.helpText : "",
    }); // Estado para armazenar os valores do formulário

    // Função para validar os dados
    const validateFields = () => {
        const data = formValues; // Use formValues para validar

        // Usar o schema de validação do Yup
        validationSchema
        .validate(data, { abortEarly: false })
        .then(() => {
            // Se a validação passar, limpar erros
            setErrors({});
            // Atualizando o campo do nó ao salvar
            updateFieldConfig(nodeId, fieldId, formValues);
        })
        .catch((validationErrors) => {
            // Se houver erros de validação, processá-los
            const formattedErrors = {};
            if (validationErrors.inner) {
            validationErrors.inner.forEach((error) => {
                formattedErrors[error.path] = error.message;
            });
            }
            setErrors(formattedErrors);
        });
        toggleDrawer();
    };

    // Converte as opções separadas por vírgula em um array
    const optionArray = formValues.options.split(",").map((option) => option.trim());

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault(); // Evita o recarregamento da página
                validateFields(); // Chama a função de validação
            }}
            >
            <h3>{__('Editar campo de seleção', 'obatala')}</h3>

            {/* Campo para definir o Label */}
            <FieldNameControl
                value={formValues.label}
                onChange={(value) => setFormValues((prev) => ({ ...prev, label: value }))}
                help={errors.label}
            />

            {/* Campo para definir o campo como obrigatório */}
            <CheckboxControl
                label={__('Campo obrigatório', 'obatala')}
                checked={formValues.required} // Use formValues para sincronizar o valor
                onChange={(isChecked) =>
                setFormValues((prev) => ({ ...prev, required: isChecked }))
                }
            />

            {/* Campo para definir as opções do Select/Radio */}
            <TextControl
                label={__('Opções de resposta (separadas por vírgulas)', 'obatala')}
                value={formValues.options} // Use formValues para sincronizar o valor
                onChange={(value) => setFormValues((prev) => ({ ...prev, options: value }))}
                placeholder={__('Opções separadas por vírgulas', 'obatala')} required
                help={errors.options} // Exibe a mensagem de erro, se houver
            />

            {/* Visualização das opções como Radio e Select */}
            {isSelect ? (
                <SelectControl
                    label={__('Prévia das opções de resposta', 'obatala')}
                    options={optionArray.map((option) => ({
                        label: option,
                        value: option,
                    }))}
                    selected={null}
                    onChange={(value) => setFormValues((prev) => ({ ...prev, selectedOption: value }))}
                />
            ) : (
                <RadioControl
                    label={__('Prévia das opções de resposta', 'obatala')}
                    options={optionArray.map((option) => ({
                    label: option,
                    value: option,
                    }))}
                    selected={null}
                    onChange={(value) => setFormValues((prev) => ({ ...prev, selectedOption: value }))}
                />
            )}

            {/* Campo para fornecer texto de ajuda */}
            <HelpTextControl
                value={formValues.helpText}
                onChange={(value) => setFormValues((prev) => ({ ...prev, helpText: value }))}
            />

            {/* Botão Salvar */}
            {tainacanMappingControls}
            <Button variant="primary"
                type="submit"
                //onClick={} // Valida os campos ao clicar em salvar
            >
                {__('Save', 'obatala')}
            </Button>
        </form>
    );
};
