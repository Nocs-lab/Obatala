import React, { useState } from "react";
import {
  TextControl,
  CheckboxControl,
  DateTimePicker,
  TextareaControl,
  Button,
} from "@wordpress/components";
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
}) => {
  const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
  const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
  const { toggleDrawer } = useDrawer();  

  const [formValues, setFormValues] = useState({
    label: config ? config.label : label ? label : "",
    required: config ? config.required : false,
    dateValue: config ? config.dateValue : dateValue ? dateValue : new Date(),
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
      <h3>Edite date picker field</h3>
      {/* Campo para definir o Label */}
      <TextControl
        label="Label"
        value={formValues.label} // Use formValues para sincronizar o valor
        onChange={(value) => {
          setFormValues((prev) => ({ ...prev, label: value }));
        }}
        placeholder="Digite o label"
        help={errors.label} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para seleção de data */}
      <fieldset>
        <legend>Select date:</legend>
        <DateTimePicker
          currentDate={formValues.dateValue || ""}
          onChange={(value) => {
            setFormValues((prev) => ({ ...prev, dateValue: value || "" }));
          }}
          is12Hour={false}
        />
      </fieldset>

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
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, helpText: value }))
        }
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
