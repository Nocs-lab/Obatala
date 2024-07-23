import React from "react";
import { SelectControl, Button, PanelRow } from "@wordpress/components";

const AddUserToSectorForm = ({
  users,
  sectors,
  selectedUser,
  selectedSector,
  onSelectUser,
  onSelectSector,
  onAddUserToSector,
  isLoading,
  onAlert,
}) => {
  return (
    <PanelRow>
      <SelectControl
        label="Usuário"
        value={selectedUser}
        options={users.map((user) => ({ label: user.name, value: user.id }))}
        onChange={(value) => onSelectUser(value)}
      />
      <SelectControl
        label="Setor"
        value={selectedSector}
        options={sectors.map((sector) => ({
          label: sector.name,
          value: sector.id,
        }))}
        onChange={(value) => onSelectSector(value)}
      />
      <Button
        isPrimary
        onClick={() => onAddUserToSector(selectedUser, selectedSector)}
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add new user to sector"}
      </Button>
    </PanelRow>
  );
};

export default AddUserToSectorForm;
