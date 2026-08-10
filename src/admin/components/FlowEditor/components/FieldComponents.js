import React from "react";
import { __ } from "@wordpress/i18n";

// Componente para renderizar os controles de Texto, Email, Telefone, Endereço
export const TextFieldControls = ({ label, placeholder, onChange }) => (
  <div>
    <label>{__('Label:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Enter the label', 'obatala')}
    />
    <label>{__('Placeholder:', 'obatala')}</label>
    <input
      type="text"
      value={placeholder}
      onChange={(e) => onChange("placeholder", e.target.value)}
      placeholder={__('Enter the placeholder', 'obatala')}
    />
  </div>
);

// Componente para renderizar os controles de Número
export const NumberFieldControls = ({ label, min, max, onChange }) => (
  <div>
    <label>{__('Label:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Enter the label', 'obatala')}
    />
    <label>{__('Minimum value:', 'obatala')}</label>
    <input
      type="number"
      value={min}
      onChange={(e) => onChange("min", e.target.value)}
      placeholder={__('Enter the minimum value', 'obatala')}
    />
    <label>{__('Maximum value:', 'obatala')}</label>
    <input
      type="number"
      value={max}
      onChange={(e) => onChange("max", e.target.value)}
      placeholder={__('Enter the maximum value', 'obatala')}
    />
  </div>
);

// Componente para renderizar os controles de DatePicker
export const DatePickerControls = ({ label, onChange }) => (
  <div>
    <label>{__('Label:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Enter the label', 'obatala')}
    />
    <label>{__('Select date:', 'obatala')}</label>
    <input
      type="date"
      onChange={(e) => onChange("value", e.target.value)}
    />
  </div>
);

// Componente para renderizar os controles de Upload de Arquivo
export const FileUploadControls = ({ label, onChange }) => (
  <div>
    <label>{__('Label:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Enter the label', 'obatala')}
    />
    <label>{__('File upload:', 'obatala')}</label>
    <input
      type="file"
      onChange={(e) => onChange("value", e.target.files[0]?.name)}
    />
  </div>
);

// Componente para renderizar os controles de Select e Radio
export const SelectRadioControls = ({ label, options, onChange }) => (
  <div>
    <label>{__('Label:', 'obatala')}</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder={__('Enter the label', 'obatala')}
    />
    <label>{__('Options (separated by commas):', 'obatala')}</label>
    <input
      type="text"
      value={options}
      onChange={(e) => onChange("options", e.target.value)}
      placeholder={__('Options, separated by commas', 'obatala')}
    />
  </div>
);
