import {
  Button,
  CheckboxControl,
  Notice,
  __experimentalNumberControl as NumberControl,
  SelectControl,
  TextareaControl,
  TextControl,
} from "@wordpress/components";
import React, { useState } from "react";
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
console.log(fieldType)
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

      {fieldType !== "email" && (
        <>
          <SelectControl
            label="Padrões Comuns"
            value=""
            options={[
              { label: "Selecione um padrão", value: "" },
              { label: "Telefone", value: "telefone" },
              { label: "CEP", value: "cep" },
              { label: "Evitar abreviação", value: "EvitarAbreviacao" },
              { label: "Capitalizar Inicial de Nome Próprio", value: "CapitalizarInicialNomeProprio",},
              { label: "Não Usar Capitalizacao", value: "NaoUsarCapitalizacao",},
              { label: "Numeros Inteiros e Fracões Decimais", value: "NumerosInteirosEfracoesDecimais", },
              { label: "Não Vazio", value: "NaoVazio" },
              { label: "Não utilizar apóstrofo", value: "Naoutilizarapostrofo",},
              { label: "Registro de Hora, Minutos e Segundos", value: "registroHoraMinutosSegundos", },
              { label: "Registro de Dia, Mês e Ano", value: "registroDiaMêsAno", },
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
                        : value === "EvitarAbreviacao"
                        ? "A entrada deve começar com uma letra maiúscula (incluindo caracteres acentuados), seguida por letras, números ou caracteres acentuados, e terminar com um ponto final. Ex: João Silva."
                        : value === "CapitalizarInicialNomeProprio"
                        ? "Capitalize as iniciais de nomes próprios e da primeira palavra, para outros termos use letras minúsculas."
                        : value === "NaoUsarCapitalizacao"
                        ? "Não use letras maiúsculas. Ex: Nome, Sobrenome"
                        : value === "NumerosInteirosEfracoesDecimais"
                        ? "Utilizar números inteiros ou frações decimais. Ex: 123 ou 123.45"
                        : value === "NaoVazio"
                        ? "O campo não pode ser vazio."
                        : value === "Naoutilizarapostrofo"
                        ? "Não utilizar apóstrofo. Ex: 'olá'"
                        : value === "registroHoraMinutosSegundos"
                        ? "Utilizar o formato HH:MM:SS. Ex: 12:34:56"
                        : value === "registroDiaMêsAno"
                        ? "Utilizar o formato DD/MM/YYYY. Ex: 31/12/2021, 9/5/2022"
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
              setFormValues((prev) => {
                const updatedValues = {
                  ...prev,
                  pattern: value,
                  required: !!value.trim(),
                  helpText: value
                    ? `Formato: ${
                        value === predefinedPatterns.telefone
                          ? "11987654321"
                          : value === predefinedPatterns.cep
                          ? "00000-000"
                          : value === predefinedPatterns.EvitarAbreviacao
                          ? "A entrada deve começar com uma letra maiúscula (incluindo caracteres acentuados), seguida por letras, números ou caracteres acentuados, e terminar com um ponto final. Ex: João Silva."
                          : value ===
                            predefinedPatterns.CapitalizarInicialNomeProprio
                          ? "Capitalize as iniciais de nomes próprios e da primeira palavra, para outros termos use letras minúsculas."
                          : value === predefinedPatterns.NaoUsarCapitalizacao
                          ? "Não use letras maiúsculas. Ex: Nome, Sobrenome"
                          : value ===
                            predefinedPatterns.NumerosInteirosEfracoesDecimais
                          ? "Utilizar números inteiros ou frações decimais. Ex: 123 ou 123.45"
                          : value === predefinedPatterns.NaoVazio
                          ? "O campo não pode ser vazio."
                          : value === predefinedPatterns.Naoutilizarapostrofo
                          ? "Não utilizar apóstrofo. Ex: 'Olá'"
                          : value ===
                            predefinedPatterns.registroHoraMinutosSegundos
                          ? "Utilizar o formato HH:MM:SS. Ex: 12:34:56"
                          : value === predefinedPatterns.registroDiaMêsAno
                          ? "Utilizar o formato DD/MM/YYYY. Ex: 31/12/2021, 9/5/2022"
                          : "(Altere no Texto de Ajuda)"
                      }`
                    : "", // Limpa o texto de ajuda se o campo de regex estiver vazio
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
        </>
      )}

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