import React, { useState } from "react";
import { __ } from "@wordpress/i18n";
import {
    TextControl,
    CheckboxControl,
    Button,
} from "@wordpress/components";
import HelpTextControl from "./HelpTextControl";
import FieldNameControl from "./FieldNameControl";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";
import { useDrawer } from "../../context/DrawerContext";

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
    label: Yup.string().required("O label é obrigatório"),
    required: Yup.boolean(),
    dateValue: Yup.date().required("A data é obrigatória"),
    helpText: Yup.string(),
});

export const DatePickerControls = ({
    nodeId,
    fieldId,
    label,
    required,
    dateValue,
    helpText,
    config, // Recebendo a configuração do campo
    tainacanMappingControls,
}) => {
    const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
    const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
    const { toggleDrawer } = useDrawer();

    const [formValues, setFormValues] = useState({
        label: config ? config.label : label ? label : "",
        required: config ? config.required : false,
        dateValue: config
        ? config.dateValue
        : dateValue
        ? new Date().toISOString().split("T")[0] // Define a data padrão como hoje
        : new Date().toISOString().split("T")[0], // Sempre inicializa com a data de hoje
        helpText: config ? config.helpText : "",
    }); // Estado para armazenar os valores do formulário

    // Função para validar os dados
    const validateFields = () => {
        const data = formValues; // Usar formValues para validar

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

    return (
        <form>
            <h3>{__('Edit date picker field', 'obatala')}</h3>
            {/* Campo para definir o Label */}
            <FieldNameControl
                value={formValues.label}
                onChange={(value) => {
                    setFormValues((prev) => ({ ...prev, label: value }));
                }}
                help={errors.label}
            />

            {/* Campo para seleção de data */}
            <input
                type="date"
                value={formValues.dateValue || ""}
                onChange={(e) => {
                setFormValues((prev) => ({ ...prev, dateValue: e.target.value }));
                }}
                style={{ display: "none" }}
            />
            {errors.dateValue && <p className="error-message">{errors.dateValue}</p>}

            {/* Campo para definir o campo como obrigatório */}
            <CheckboxControl
                label="Preenchimento obrigatório"
                checked={formValues.required} // Use formValues para sincronizar o valor
                onChange={(isChecked) =>
                setFormValues((prev) => ({ ...prev, required: isChecked }))
                }
            />

            {/* Campo para fornecer texto de ajuda */}
            <HelpTextControl
                value={formValues.helpText}
                onChange={(value) =>
                setFormValues((prev) => ({ ...prev, helpText: value }))
                }
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
