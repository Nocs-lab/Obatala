import React, { useState } from "react";
import {
  TextControl,
  CheckboxControl,
  __experimentalNumberControl as NumberControl,
  TextareaControl,
  Button,
} from "@wordpress/components";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
  label: Yup.string().required("O label é obrigatório"),
  min: Yup.number().nullable(),
  max: Yup.number()
    .nullable()
    .test("is-greater", "O valor máximo deve ser maior que o valor mínimo", function (value) {
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
}) => {
  const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
  const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
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
  };

  return (
    <form>
      {/* Campo para definir o Label */}
      <TextControl
        label="Label"
        value={formValues.label} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, label: value }))}
        placeholder="Digite o label"
        style={{ marginBottom: "10px" }}
        help={errors.label} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o campo como obrigatório */}
      <CheckboxControl
        label="Obrigatório"
        checked={formValues.required} // Use formValues para sincronizar o valor
        onChange={(isChecked) =>
          setFormValues((prev) => ({ ...prev, required: isChecked }))
        }
        style={{ marginBottom: "10px" }}
      />

      {/* Campo para definir o valor mínimo */}
      <NumberControl
        label="Valor Mínimo"
        value={formValues.min} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, min: value }))}
        placeholder="Digite o valor mínimo"
        style={{ marginBottom: "10px" }}
        help={errors.min} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o valor máximo */}
      <NumberControl
        label="Valor Máximo"
        value={formValues.max} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, max: value }))}
        placeholder="Digite o valor máximo"
        style={{ marginBottom: "10px" }}
        help={errors.max} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o step */}
      <NumberControl
        label="Step (Incremento)"
        value={formValues.step} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, step: value }))}
        placeholder="Digite o incremento"
        style={{ marginBottom: "10px" }}
        help={errors.step} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para fornecer texto de ajuda */}
      <TextareaControl
        label="Texto de Ajuda"
        value={formValues.helpText} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, helpText: value }))}
        placeholder="Digite um texto de ajuda"
        style={{ marginBottom: "10px" }}
      />

      {/* Botão Salvar */}
      <Button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "10px",
          display: "block",
        }}
        onClick={validateFields} // Valida os campos ao clicar em salvar
      >
        Save
      </Button>
    </form>
  );
};
