import {
  Button,
  CheckboxControl,
  RadioControl,
  TextareaControl,
  TextControl,
} from "@wordpress/components";
import React, { useState } from "react";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";

// Esquema de validação usando Yup
const validationSchema = Yup.object().shape({
  label: Yup.string().required("O label é obrigatório"),
  options: Yup.string().required("As opções são obrigatórias"),
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
  config, // Recebendo a configuração do campo
}) => {
  const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
  const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
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
  };

  // Converte as opções separadas por vírgula em um array
  const optionArray = formValues.options.split(",").map((option) => option.trim());

  return (
    <form onSubmit={validateFields}>
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
      />

      {/* Campo para definir as opções do Select/Radio */}
      <TextControl
        label="Opções (separadas por vírgula)"
        value={formValues.options} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, options: value }))}
        placeholder="Opções, separadas por vírgula" required
        style={{ marginBottom: "10px" }}
        help={errors.options} // Exibe a mensagem de erro, se houver
      />

      {/* Visualização das opções como Radio */}
      <RadioControl
        label="Pré-visualização das opções"
        options={optionArray.map((option) => ({
          label: option,
          value: option,
        }))}
        selected={null}
        onChange={(value) => setFormValues((prev) => ({ ...prev, selectedOption: value }))}
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
        type="submit"
        //onClick={} // Valida os campos ao clicar em salvar
      >
        Save
      </Button>
    </form>
  );
};
