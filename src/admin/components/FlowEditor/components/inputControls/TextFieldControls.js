import React, { useState } from "react";
import {
  TextControl,
  CheckboxControl,
  TextareaControl,
  Button,
  SelectControl,
  __experimentalNumberControl as NumberControl,
  Notice,
} from "@wordpress/components";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";
import { useDrawer } from "../../context/DrawerContext";

// Padrões regex predefinidos
const predefinedPatterns = {
  telefone: "^[0-9]{11}$", // Ex: 11987654321
  cep: "([0-9]{5})(-?)([0-9]{3})", // Ex: 12345-678
};

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
  label: Yup.string().required("O label é obrigatório"),
  placeholder: Yup.string(),
  required: Yup.boolean(),
  minLength: Yup.number()
    .min(0, "Tamanho mínimo não pode ser negativo")
    .nullable(),
  maxLength: Yup.number()
    .min(Yup.ref("minLength"), "O tamanho máximo deve ser maior que o mínimo")
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
        pattern: "O padrão de Regex informado é inválido.",
      }));
      setMessage({
        type: "error",
        text: "Erro ao salvar. O padrão de Regex é inválido.",
      });
      return;
    }

    validationSchema
      .validate(data, { abortEarly: false })
      .then(() => {
        setErrors({});
        updateFieldConfig(nodeId, fieldId, formValues);
        setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
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
          text: "Erro ao salvar. Por favor, revise os campos.",
        });
      });
    toggleDrawer()
  };

  return (
    <form>
      <h3>Edit field</h3>

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

      <TextControl
        label="Label"
        value={formValues.label}
        onChange={(value) => {
          setFormValues((prev) => ({ ...prev, label: value }));
          setLabel(value);
        }}
        placeholder="Digite o label"
        help={errors.label}
      />

      <TextControl
        label="Placeholder"
        value={formValues.placeholder}
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, placeholder: value }))
        }
        placeholder="Digite o placeholder"
        help={errors.placeholder}
      />

      <CheckboxControl
        label="Preenchimento obrigatório"
        checked={formValues.required}
        onChange={(isChecked) =>
          setFormValues((prev) => ({ ...prev, required: isChecked }))
        }
      />

      <NumberControl
        label="Tamanho mínimo"
        value={formValues.minLength}
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, minLength: value }))
        }
        help={errors.minLength}
      />

      <NumberControl
        label="Tamanho máximo"
        value={formValues.maxLength}
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, maxLength: value }))
        }
        help={errors.maxLength}
      />

      <SelectControl
        label="Padrões Comuns"
        value=""
        options={[
          { label: "Selecione um padrão", value: "" },
          { label: "Telefone", value: "telefone" },
          { label: "CEP", value: "cep" },
        ]}
        onChange={(value) => {
          const pattern = predefinedPatterns[value] || "";
          setFormValues((prev) => ({
            ...prev,
            pattern,
            required: !!pattern || prev.required,
            helpText: pattern
              ? `Formato: ${
                  value === "telefone"
                    ? "11987654321"
                    : value === "cep"
                    ? "00000-000"
                    : ""
                }`
              : prev.helpText, // Define o texto de ajuda com base no padrão
          }));
        }}
      />

      <TextControl
        label="Padrão de Validação (Regex)"
        value={formValues.pattern}
        onChange={(value) => {
          setFormValues((prev) => ({
            ...prev,
            pattern: value,
            required: value.trim() !== "" || prev.required,
            helpText: value
              ? `Formato: ${
                  value === predefinedPatterns.telefone
                    ? "11987654321"
                    : value === predefinedPatterns.cep
                    ? "00000-000"
                    : "(Altere no Texto de Ajuda)"
                }`
              : prev.helpText, // Define o texto de ajuda se o Regex for alterado
          }));
          if (value && !isValidRegex(value)) {
            setErrors((prev) => ({
              ...prev,
              pattern: "O padrão de Regex informado é inválido.",
            }));
          } else {
            setErrors((prev) => {
              const { pattern, ...rest } = prev;
              return rest;
            });
          }
        }}
        placeholder="Digite um padrão de validação (Regex)"
        help={formValues.helpText}
      />

      <TextareaControl
        label="Texto de Ajuda"
        value={formValues.helpText}
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, helpText: value }))
        }
        placeholder="Digite um texto de ajuda"
      />

      <Button variant="primary" onClick={validateFields}>
        Save
      </Button>
    </form>
  );
};