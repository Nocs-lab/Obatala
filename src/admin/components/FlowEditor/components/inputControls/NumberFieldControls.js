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
    <form>
      <h3>Edit number field</h3>

      {/* Campo para definir o Label */}
      <TextControl
        label="Label"
        value={formValues.label} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, label: value }))}
        placeholder="Digite o label"
        help={errors.label} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o valor mínimo */}
      <NumberControl
        label="Valor mínimo"
        value={formValues.min} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, min: value }))}
        placeholder="Digite o valor mínimo"
        help={errors.min} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o valor máximo */}
      <NumberControl
        label="Valor máximo"
        value={formValues.max} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, max: value }))}
        placeholder="Digite o valor máximo"
        help={errors.max} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o step */}
      <NumberControl
        label="Step (Incremento)"
        value={formValues.step} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, step: value }))}
        placeholder="Digite o incremento"
        help={errors.step} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o campo como obrigatório */}
      <CheckboxControl
        label="Preenchimento obrigatório"
        checked={formValues.required} // Use formValues para sincronizar o valor
        onChange={(isChecked) =>
          setFormValues((prev) => ({ ...prev, required: isChecked }))
        }
      />

      {/* Campo para fornecer texto de ajuda */}
      <TextareaControl
        label="Texto de Ajuda"
        value={formValues.helpText} // Use formValues para sincronizar o valor
        onChange={(value) => setFormValues((prev) => ({ ...prev, helpText: value }))}
        placeholder="Digite um texto de ajuda"
      />

      {/* Botão Salvar */}
      <Button
        variant="primary"
        onClick={validateFields} // Valida os campos ao clicar em salvar
      >
        Save
      </Button>
    </form>
  );
};
