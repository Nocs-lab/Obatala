import React, { useState } from "react";
import {
  TextControl,
  CheckboxControl,
  TextareaControl,
  Button,
  __experimentalNumberControl as NumberControl,
} from "@wordpress/components";
import * as Yup from "yup";
import { useFlowContext } from "../../context/FlowContext";
import { useDrawer } from "../../context/DrawerContext";

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
  pattern: Yup.string().matches(/^(?:|\/.*\/)$/, "Padrão de Regex inválido"),
  helpText: Yup.string(),
});

export const TextFieldControls = ({
  nodeId,
  fieldId,
  fieldType,
  label,
  setLabel,
  config, // Recebendo a configuração do campo
}) => {
  const { updateFieldConfig } = useFlowContext(); // Usando a função do contexto
  const [errors, setErrors] = useState({}); // Estado para armazenar erros de validação
  const { toggleDrawer } = useDrawer();  
  const [formValues, setFormValues] = useState({
    label:  config ? config.label : label ? label : "",
    placeholder: config ? config.placeholder : "",
    required: config ? config.required : false,
    minLength: config ? config.minLength : 0,
    maxLength: config ? config.maxLength : 100,
    pattern: config ? config.pattern : "",
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
      <h3>Edit field</h3>

      {/* Campo para definir o Label */}
      <TextControl
        label="Label"
        value={formValues.label} // Use formValues para sincronizar o valor
        onChange={(value) => {
          setFormValues((prev) => ({ ...prev, label: value }));
          setLabel(value);
        }}
        placeholder="Digite o label"
        help={errors.label} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o Placeholder */}
      <TextControl
        label="Placeholder"
        value={formValues.placeholder} // Use formValues para sincronizar o valor
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, placeholder: value }))
        }
        placeholder="Digite o placeholder"
        help={errors.placeholder} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o campo como obrigatório */}
      <CheckboxControl
        label="Preenchimento obrigatório"
        checked={formValues.required} // Use formValues para sincronizar o valor
        onChange={(isChecked) =>
          setFormValues((prev) => ({ ...prev, required: isChecked }))
        }
      />

      {/* Campo para definir o tamanho mínimo de caracteres */}
      <NumberControl
        label="Tamanho mínimo"
        value={formValues.minLength} // Use formValues para sincronizar o valor
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, minLength: value }))
        }
        help={errors.minLength} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir o tamanho máximo de caracteres */}
      <NumberControl
        label="Tamanho máximo"
        value={formValues.maxLength} // Use formValues para sincronizar o valor
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, maxLength: value }))
        }
        help={errors.maxLength} // Exibe a mensagem de erro, se houver
      />

      {/* Campo para definir um padrão de validação usando regex */}
      <TextControl
        label="Padrão de Validação (Regex)"
        value={formValues.pattern} // Use formValues para sincronizar o valor
        onChange={(value) =>
          setFormValues((prev) => ({ ...prev, pattern: value }))
        }
        placeholder="Digite um padrão de validação (Regex)"
        help={errors.pattern} // Exibe a mensagem de erro, se houver
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
      <Button variant="primary"
        onClick={validateFields} // Valida os campos ao clicar em salvar
      >
        Save
      </Button>
    </form>
  );
};
