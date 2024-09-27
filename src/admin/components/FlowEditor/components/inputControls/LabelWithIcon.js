import React from "react";
import { Icon } from "@wordpress/components";
import {
  edit,
  trash,
  paragraph,
  check,
  keyboard,
  calendar,
  link,
  commentEditLink,
  seen,
  listView,
  commentContent,
  mobile,
  file,
  mapMarker,
} from "@wordpress/icons";

const IconForType = ({ type }) => {
  const iconMapping = {
    text: paragraph, // Ícone para tipo de input texto
    edit: edit,
    checkbox: check,
    radio: listView,
    select: listView,
    number: keyboard,
    datepicker: calendar,
    email: commentContent,
    url: link,
    textarea: commentEditLink,
    password: seen,
    phone: mobile,
    upload: file,
    address: mapMarker,
  };

  const SelectedIcon = iconMapping[type]; // Pega o componente do ícone correspondente

  return SelectedIcon ? <Icon icon={SelectedIcon} size={12} /> : null; // Retorna null se o type não corresponder a nenhum ícone
};

const LabelWithIcon = ({ label, type }) => (
  <div
    style={{
      display: "flex",
    }}
  >
    <div className="step-icon">
      <IconForType type={type} /> 
    </div>
    <div className="step-label">{label}</div>
  </div>
);

export default LabelWithIcon;
