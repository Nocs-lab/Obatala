import React, { useState } from "react";
import { __ } from "@wordpress/i18n";
import {
    TextControl,
    CheckboxControl,
    __experimentalNumberControl as NumberControl,
    Button,
} from "@wordpress/components";
import HelpTextControl from "./HelpTextControl";
import FieldNameControl from "./FieldNameControl";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";
import { useDrawer } from "../../context/DrawerContext";

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
    label: Yup.string().required(__('The label is required', 'obatala')),
    min: Yup.number().nullable(),
    max: Yup.number()
        .nullable()
        .test("is-greater", __('The maximum value must be greater than the minimum value', 'obatala'), function (value) {
        const { min } = this.parent;
        return value === undefined || min === undefined || value >= min;
        }),
    step: Yup.number().nullable(),
    required: Yup.boolean(),
    helpText: Yup.string(),
});

export const NumberFieldControls = ({
    nodeId,
    fieldId,
    label,
    min,
    max,
    step,
    required,
    helpText,
    config, // Recebendo a configuração do campo
    tainacanMappingControls,
}) => {
    const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
    const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
    const { toggleDrawer } = useDrawer();  
    
    const [formValues, setFormValues] = useState({
        label: config ? config.label : label ? label : "",
        min: config ? config.min : min ? min : null,
        max: config ? config.max : max ? max : null,
        step: config ? config.step : step ? step : 1,
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
        toggleDrawer()
    };

    return (
        <form className="flex-form">
            <h3>{__('Edit number field', 'obatala')}</h3>

            {/* Campo para definir o Label */}
            <FieldNameControl
                value={formValues.label}
                onChange={(value) => setFormValues((prev) => ({ ...prev, label: value }))}
                help={errors.label}
            />

            {/* Campo para definir o valor mínimo */}
            <NumberControl
                label={__('Minimum value', 'obatala')}
                value={formValues.min} // Use formValues para sincronizar o valor
                onChange={(value) => setFormValues((prev) => ({ ...prev, min: value }))}
                placeholder={__('Enter the minimum value', 'obatala')}
                help={errors.min} // Exibe a mensagem de erro, se houver
            />

            {/* Campo para definir o valor máximo */}
            <NumberControl
                label={__('Maximum value', 'obatala')}
                value={formValues.max} // Use formValues para sincronizar o valor
                onChange={(value) => setFormValues((prev) => ({ ...prev, max: value }))}
                placeholder={__('Enter the maximum value', 'obatala')}
                help={errors.max} // Exibe a mensagem de erro, se houver
            />

            {/* Campo para definir o step */}
            <NumberControl
                label={__('Step (Increment)', 'obatala')}
                value={formValues.step} // Use formValues para sincronizar o valor
                onChange={(value) => setFormValues((prev) => ({ ...prev, step: value }))}
                placeholder={__('Enter the increment', 'obatala')}
                help={errors.step} // Exibe a mensagem de erro, se houver
            />

            {/* Campo para definir o campo como obrigatório */}
            <CheckboxControl
                label={__('Required field', 'obatala')}
                checked={formValues.required} // Use formValues para sincronizar o valor
                onChange={(isChecked) =>
                setFormValues((prev) => ({ ...prev, required: isChecked }))
                }
            />

            {/* Campo para fornecer texto de ajuda */}
            <HelpTextControl
                value={formValues.helpText}
                onChange={(value) => setFormValues((prev) => ({ ...prev, helpText: value }))}
            />

            {tainacanMappingControls}
            {/* Botão Salvar */}
            <Button
                variant="primary"
                onClick={validateFields} // Valida os campos ao clicar em salvar
            >
                {__('Save', 'obatala')}
            </Button>
        </form>
    );
};
