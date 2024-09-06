import React from "react";

// Componente para renderizar os controles de Texto, Email, Telefone, Endereço
export const TextFieldControls = ({ label, placeholder, onChange }) => (
  <div>
    <label>Label:</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder="Digite o label"
      style={{ width: "100%", marginBottom: "10px" }}
    />
    <label>Placeholder:</label>
    <input
      type="text"
      value={placeholder}
      onChange={(e) => onChange("placeholder", e.target.value)}
      placeholder="Digite o placeholder"
      style={{ width: "100%", marginBottom: "10px" }}
    />
  </div>
);

// Componente para renderizar os controles de Número
export const NumberFieldControls = ({ label, min, max, onChange }) => (
  <div>
    <label>Label:</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder="Digite o label"
      style={{ width: "100%", marginBottom: "10px" }}
    />
    <label>Valor Mínimo:</label>
    <input
      type="number"
      value={min}
      onChange={(e) => onChange("min", e.target.value)}
      placeholder="Digite o valor mínimo"
      style={{ width: "100%", marginBottom: "10px" }}
    />
    <label>Valor Máximo:</label>
    <input
      type="number"
      value={max}
      onChange={(e) => onChange("max", e.target.value)}
      placeholder="Digite o valor máximo"
      style={{ width: "100%", marginBottom: "10px" }}
    />
  </div>
);

// Componente para renderizar os controles de DatePicker
export const DatePickerControls = ({ label, onChange }) => (
  <div>
    <label>Label:</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder="Digite o label"
      style={{ width: "100%", marginBottom: "10px" }}
    />
    <label>Selecionar Data:</label>
    <input
      type="date"
      onChange={(e) => onChange("value", e.target.value)}
      style={{ width: "100%", marginBottom: "10px" }}
    />
  </div>
);

// Componente para renderizar os controles de Upload de Arquivo
export const FileUploadControls = ({ label, onChange }) => (
  <div>
    <label>Label:</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder="Digite o label"
      style={{ width: "100%", marginBottom: "10px" }}
    />
    <label>Upload de Arquivo:</label>
    <input
      type="file"
      onChange={(e) => onChange("value", e.target.files[0]?.name)}
      style={{ width: "100%", marginBottom: "10px" }}
    />
  </div>
);

// Componente para renderizar os controles de Select e Radio
export const SelectRadioControls = ({ label, options, onChange }) => (
  <div>
    <label>Label:</label>
    <input
      type="text"
      value={label}
      onChange={(e) => onChange("label", e.target.value)}
      placeholder="Digite o label"
      style={{ width: "100%", marginBottom: "10px" }}
    />
    <label>Opções (separadas por vírgula):</label>
    <input
      type="text"
      value={options}
      onChange={(e) => onChange("options", e.target.value)}
      placeholder="Opções, separadas por vírgula"
      style={{ width: "100%", marginBottom: "10px" }}
    />
  </div>
);
