import {
    Button,
    CheckboxControl,
    Notice,
    __experimentalNumberControl as NumberControl,
    SelectControl,
    TextControl,
} from "@wordpress/components";
import HelpTextControl from "./HelpTextControl";
import FieldNameControl from "./FieldNameControl";
import React, { useState } from "react";
import { __, sprintf } from "@wordpress/i18n";
import * as Yup from "yup";
import { useDrawer } from "../../context/DrawerContext";
import { useFlowContext } from "../../context/FlowContext";

// Padrões regex predefinidos
const predefinedPatterns = {
    telefone: "^[0-9]{11}$", // Ex: 11987654321
    cep: "([0-9]{5})(-?)([0-9]{3})", // Ex: 12345-678
    EvitarAbreviacao: "^[A-ZÁÉÍÓÚÜÑ][A-Za-z0-9áéíóúüñ]*[.]$",
    CapitalizarInicialNomeProprio: "^([A-Z0-9]){1}(.)*",
    NaoUsarCapitalizacao: "[a-z]+",
    NumerosInteirosEfracoesDecimais: "^[0-9]+([.][0-9]+)?$",
    NaoVazio: ".+",
    Naoutilizarapostrofo : "^[^']*$",
    registroHoraMinutosSegundos: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$",
    registroDiaMêsAno: "^(0?[1-9]|[12][0-9]|3[01])/(0?[1-9]|1[0-2])/[0-9]{4}$",
};

const getPatternHelpText = (patternKey) => {
    const formats = {
        telefone: '11987654321',
        cep: '00000-000',
        EvitarAbreviacao: __('The entry must start with an uppercase letter, including accented characters, followed by letters, numbers, or accented characters, and end with a period. Example: João Silva.', 'obatala'),
        CapitalizarInicialNomeProprio: __('Capitalize the initials of proper names and the first word, and use lowercase letters for other terms.', 'obatala'),
        NaoUsarCapitalizacao: __('Do not use uppercase letters. Example: first name, last name', 'obatala'),
        NumerosInteirosEfracoesDecimais: __('Use whole numbers or decimal fractions. Example: 123 or 123.45', 'obatala'),
        NaoVazio: __('The field cannot be empty.', 'obatala'),
        Naoutilizarapostrofo: __("Do not use apostrophes. Example: 'hello'", 'obatala'),
        registroHoraMinutosSegundos: __('Use the HH:MM:SS format. Example: 12:34:56', 'obatala'),
        registroDiaMêsAno: __('Use the DD/MM/YYYY format. Example: 31/12/2021, 9/5/2022', 'obatala'),
    };
    const format = formats[patternKey] || '';

    return format ? sprintf(__('Format: %s', 'obatala'), format) : '';
};

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
    label: Yup.string().required(__('The label is required', 'obatala')),
    placeholder: Yup.string(),
    required: Yup.boolean(),
    minLength: Yup.number()
        .min(0, __('Minimum length cannot be negative', 'obatala'))
        .nullable(),
    maxLength: Yup.number()
        .min(Yup.ref("minLength"), __('The maximum length must be greater than the minimum length', 'obatala'))
        .nullable(),
    helpText: Yup.string(),
});

export const TextFieldControls = ({
    nodeId,
    fieldId,
    fieldType,
    label,
    setLabel,
    config,
    tainacanMappingControls,
}) => {
    const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
    const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
    const { toggleDrawer } = useDrawer();  
    const [formValues, setFormValues] = useState({
        label: config ? config.label : label || "",
        placeholder: config ? config.placeholder : "",
        required: config ? config.required : false,
        minLength: config ? config.minLength : 0,
        maxLength: config ? config.maxLength : 100,
        pattern: config ? config.pattern : "",
        helpText: config ? config.helpText : "",
    });
    const [message, setMessage] = useState(null); // Para exibir mensagem de sucesso ou erro

    // Função para validar regex
    const isValidRegex = (pattern) => {
        try {
            new RegExp(pattern);
            return true;
        } catch {
            return false;
        }
    };

    // Função para validar os dados
    const validateFields = () => {
        const data = formValues;

        // Validação do regex
        if (formValues.pattern && !isValidRegex(formValues.pattern)) {
        setErrors((prev) => ({
            ...prev,
            pattern: __('The Regex pattern provided is invalid.', 'obatala'),
        }));
        setMessage({
            type: "error",
            text: __('Error saving. The Regex pattern is invalid.', 'obatala'),
        });
        return;
        }

        validationSchema
        .validate(data, { abortEarly: false })
        .then(() => {
            setErrors({});
            updateFieldConfig(nodeId, fieldId, formValues);
            setMessage({ type: "success", text: __('Settings saved successfully!', 'obatala') });
        })
        .catch((validationErrors) => {
            const formattedErrors = {};
            if (validationErrors.inner) {
            validationErrors.inner.forEach((error) => {
                formattedErrors[error.path] = error.message;
            });
            }
            setErrors(formattedErrors);
            setMessage({
            type: "error",
            text: __('Error saving. Please review the fields.', 'obatala'),
            });
        });
        toggleDrawer()
    };

    const headingLabel = fieldType === 'address' ? __('Editar campo de endereço', 'obatala') : __('Editar campo de texto', 'obatala');

    return (
        <form className="flex-form">
            <h3>{headingLabel}</h3>

            {/* Mensagem de sucesso ou erro */}
            {message && (
                <Notice
                status={message.type}
                isDismissible
                onRemove={() => setMessage(null)} // Atualiza o estado para null ao fechar
                >
                {message.text}
                </Notice>
            )}

            <FieldNameControl
                value={formValues.label}
                onChange={(value) => {
                    setFormValues((prev) => ({ ...prev, label: value }));
                    setLabel(value);
                }}
                help={errors.label}
            />

            <TextControl
                label={__('Texto de exemplo', 'obatala')}
                value={formValues.placeholder}
                onChange={(value) =>
                setFormValues((prev) => ({ ...prev, placeholder: value }))
                }
                placeholder={__('Digite o placeholder', 'obatala')}
                help={errors.placeholder}
            />

            <CheckboxControl
                label={__('Campo obrigatório', 'obatala')}
                checked={formValues.required}
                onChange={(isChecked) =>
                setFormValues((prev) => ({ ...prev, required: isChecked }))
                }
            />

            <NumberControl
                label={__('Comprimento mínimo', 'obatala')}
                value={formValues.minLength}
                onChange={(value) =>
                setFormValues((prev) => ({ ...prev, minLength: value }))
                }
                help={errors.minLength}
            />

            <NumberControl
                label={__('Comprimento máximo', 'obatala')}
                value={formValues.maxLength}
                onChange={(value) =>
                setFormValues((prev) => ({ ...prev, maxLength: value }))
                }
                help={errors.maxLength}
            />

            {fieldType !== "email" && (
                <>
                <SelectControl
                    label={__('Padrões comuns', 'obatala')}
                    value=""
                    options={[
                        { label: __('Selecione um padrão', 'obatala'), value: "" },
                        { label: __('Phone', 'obatala'), value: "telefone" },
                        { label: __('ZIP code', 'obatala'), value: "cep" },
                        { label: __('Avoid abbreviation', 'obatala'), value: "EvitarAbreviacao" },
                        { label: __('Capitalize proper name initials', 'obatala'), value: "CapitalizarInicialNomeProprio",},
                        { label: __('Do not use capitalization', 'obatala'), value: "NaoUsarCapitalizacao",},
                        { label: __('Whole numbers and decimal fractions', 'obatala'), value: "NumerosInteirosEfracoesDecimais", },
                        { label: __('Not empty', 'obatala'), value: "NaoVazio" },
                        { label: __('Do not use apostrophes', 'obatala'), value: "Naoutilizarapostrofo",},
                        { label: __('Hour, minute, and second record', 'obatala'), value: "registroHoraMinutosSegundos", },
                        { label: __('Day, month, and year record', 'obatala'), value: "registroDiaMêsAno", },
                    ]}
                    onChange={(value) => {
                        const pattern = predefinedPatterns[value] || "";
                        setFormValues((prev) => ({
                            ...prev,
                            pattern,
                            required: !!pattern || prev.required,
                            helpText: pattern ? getPatternHelpText(value) : prev.helpText,
                        }));
                    }}
                />

                <TextControl
                    label={__('Padrão de validação (Regex)', 'obatala')}
                    value={formValues.pattern}
                    onChange={(value) => {
                    setFormValues((prev) => {
                        const matchedPattern = Object.entries(predefinedPatterns).find(
                        ([, regex]) => regex === value
                        );
                        const matchedPatternKey = matchedPattern?.[0];
                        return {
                        ...prev,
                        pattern: value,
                        required: !!value.trim(),
                        helpText: matchedPatternKey ? getPatternHelpText(matchedPatternKey) : "",
                        };

                        if (!value.trim()) {
                        // Se o campo de regex for apagado
                        updatedValues.required = false; // Desmarca a obrigatoriedade
                        }

                        return updatedValues;
                    });

                    if (value && !isValidRegex(value)) {
                        setErrors((prev) => ({
                        ...prev,
                        pattern: __('The Regex pattern provided is invalid.', 'obatala'),
                        }));
                    } else {
                        setErrors((prev) => {
                        const { pattern, ...rest } = prev;
                        return rest;
                        });
                    }
                    }}
                    placeholder={__('Digite um padrão de validação (Regex)', 'obatala')}
                    help={formValues.helpText}
                />
                </>
            )}

            <HelpTextControl
                value={formValues.helpText}
                onChange={(value) =>
                setFormValues((prev) => ({ ...prev, helpText: value }))
                }
            />

            {tainacanMappingControls}
            <Button variant="primary" onClick={validateFields}>
                {__('Save', 'obatala')}
            </Button>
        </form>
    );
};
