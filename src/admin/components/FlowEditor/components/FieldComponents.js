import React from "react";
import { __ } from "@wordpress/i18n";

// Componente para renderizar os controles de Texto, Email, Telefone, Endereço
export const TextFieldControls = ({ label, placeholder, onChange }) => (
  <div>
    <label>{__('Rótulo:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Digite o rótulo', 'obatala')}
    />
    <label>{__('Texto de exemplo:', 'obatala')}</label>
    <input
      type="text"
      value={placeholder}
      onChange={(e) => onChange("placeholder", e.target.value)}
      placeholder={__('Digite o texto de exemplo', 'obatala')}
    />
  </div>
);

// Componente para renderizar os controles de Número
export const NumberFieldControls = ({ label, min, max, onChange }) => (
  <div>
    <label>{__('Rótulo:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Digite o rótulo', 'obatala')}
    />
    <label>{__('Valor mínimo:', 'obatala')}</label>
    <input
      type="number"
      value={min}
      onChange={(e) => onChange("min", e.target.value)}
      placeholder={__('Digite o valor mínimo', 'obatala')}
    />
    <label>{__('Valor máximo:', 'obatala')}</label>
    <input
      type="number"
      value={max}
      onChange={(e) => onChange("max", e.target.value)}
      placeholder={__('Digite o valor máximo', 'obatala')}
    />
  </div>
);

// Componente para renderizar os controles de DatePicker
export const DatePickerControls = ({ label, onChange }) => (
  <div>
    <label>{__('Rótulo:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Digite o rótulo', 'obatala')}
    />
    <label>{__('Selecionar data:', 'obatala')}</label>
    <input
      type="date"
      onChange={(e) => onChange("value", e.target.value)}
    />
  </div>
);

// Componente para renderizar os controles de Upload de Arquivo
export const FileUploadControls = ({ label, onChange }) => (
  <div>
    <label>{__('Rótulo:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Digite o rótulo', 'obatala')}
    />
    <label>{__('Upload de arquivo:', 'obatala')}</label>
    <input
      type="file"
      onChange={(e) => onChange("value", e.target.files[0]?.name)}
    />
  </div>
);

// Componente para renderizar os controles de Select e Radio
export const SelectRadioControls = ({ label, options, onChange }) => (
  <div>
    <label>{__('Rótulo:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Digite o rótulo', 'obatala')}
    />
    <label>{__('Opções (separadas por vírgulas):', 'obatala')}</label>
    <input
      type="text"
      value={options}
      onChange={(e) => onChange("options", e.target.value)}
      placeholder={__('Opções separadas por vírgulas', 'obatala')}
    />
  </div>
);
