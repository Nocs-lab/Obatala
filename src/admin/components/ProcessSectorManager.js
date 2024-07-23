import { useState, useEffect, useReducer } from "react";
import { Spinner, Panel, PanelBody, Notice, Animate } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import Reducer, { initialState } from "./Modals/reducer";
import SectorCard from "./ProcessSectorManager/SectorCard";
import ConfirmDeleteModal from "./Modals/ConfirmDeleteModal";
import { useError } from "../contexts/ErrorContext";
import ErrorNotification from "./ErrorNotification";
import AddSectorForm from "./ProcessSectorManager/AddSectorForm";
import AddUserToSectorForm from "./ProcessSectorManager/AddUserToSectorForm";

const ProcessSectorManager = () => {
  const [sectors, setSectors] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState("");
  const [state, dispatch] = useReducer(Reducer, initialState);
  const { addError } = useError();

  useEffect(() => {
    fetchSectors();
    fetchUsers();
  }, []);

  const fetchSectors = () => {
    setIsLoading(true);
    apiFetch({ path: "/wp/v2/sector?per_page=100&_embed" })
      .then((data) => {
        setSectors(data);
        setIsLoading(false);
        // Inicializa o setor selecionado com o primeiro setor disponível
        if (data.length > 0) {
          setSelectedSector(data[0].id.toString());
        }
      })
      .catch((error) => {
        addError(error);
        setIsLoading(false);
      });
  };

  const fetchUsers = () => {
    setIsLoading(true);
    apiFetch({ path: "/wp/v2/users?per_page=100&_embed" })
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
        // Inicializa o usuário selecionado com o primeiro usuário disponível
        if (data.length > 0) {
          setSelectedUser(data[0].id.toString());
        }
      })
      .catch((error) => {
        addError(error);
        setIsLoading(false);
      });
  };

  const handleAddSector = (name, description) => {
    setIsLoading(true);
    apiFetch({
      path: "/wp/v2/sector",
      method: "POST",
      data: { name, description },
    })
      .then((newSector) => {
        setSectors([...sectors, newSector]);
        setIsLoading(false);
      })
      .catch((error) => {
        addError(error);
        setIsLoading(false);
      });
  };

  const handleAddUserToSector = (selectedUser, selectedSector) => {
    console.log("Selected User ID:", selectedUser);
    console.log("Selected Sector ID:", selectedSector);
    if (selectedUser === "" || selectedSector === "") return;
    const user = users.find((user) => user.id.toString() === selectedUser);
    if (!user) {
      console.error("Usuário não encontrado:", selectedUser);
      setIsLoading(false);
      return;
    }
    console.log("User before update:", user);
    const updatedSectorIds = user.meta.sector_ids
      ? [...user.meta.sector_ids]
      : [];

    if (updatedSectorIds.includes(parseInt(selectedSector))) {
      setAlert("O usuário já está no setor selecionado.");
      setIsLoading(false);
      return;
    }

    updatedSectorIds.push(parseInt(selectedSector));
    console.log("Updated Sector IDs:", updatedSectorIds);

    setIsLoading(true);
    apiFetch({
      path: `/wp/v2/users/${selectedUser}`,
      method: "PUT",
      data: { meta: { sector_ids: updatedSectorIds } },
    })
      .then(() => {
        console.log("User successfully updated");
        const updatedUsers = users.map((user) =>
          user.id.toString() === selectedUser
            ? { ...user, meta: { sector_ids: updatedSectorIds } }
            : user
        );
        setUsers(updatedUsers);
        setSelectedUser(users.length > 0 ? users[0].id.toString() : "");
        setSelectedSector(sectors.length > 0 ? sectors[0].id.toString() : "");
        setIsLoading(false);
        setAlert("");
      })
      .catch((error) => {
        addError(error);
        setIsLoading(false);
      });
  };

  const handleRemoveUserFromSector = (userId, sectorId) => {
    const user = users.find((user) => user.id === userId);
    if (!user) {
      console.error("Usuário não encontrado:", userId);
      return;
    }
    const updatedSectorIds = user.meta.sector_ids
      ? user.meta.sector_ids.filter((id) => id !== sectorId)
      : [];
    console.log("Updated Sector IDs after removal:", updatedSectorIds);

    setIsLoading(true);
    apiFetch({
      path: `/wp/v2/users/${userId}`,
      method: "PUT",
      data: { meta: { sector_ids: updatedSectorIds } },
    })
      .then(() => {
        console.log("User successfully updated");
        const updatedUsers = users.map((user) =>
          user.id === userId
            ? { ...user, meta: { sector_ids: updatedSectorIds } }
            : user
        );
        setUsers(updatedUsers);
        setIsLoading(false);
      })
      .catch((error) => {
        addError(error);
        setIsLoading(false);
      });
  };

  const handleDeleteSector = (id) => {
    apiFetch({ path: `/wp/v2/sector/${id}?force=true`, method: "DELETE" })
      .then(() => {
        setSectors(sectors.filter((sector) => sector.id !== id));
      })
      .catch((error) => {
        addError(error);
      });
  };

  const handleConfirmDeleteSector = (id) => {
    dispatch({ type: "OPEN_MODAL_SECTOR", payload: id });
  };

  const handleCancel = () => {
    dispatch({ type: "CLOSE_MODAL" });
  };

  return (
    <>
      {/* Título e cabeçalho da página */}
      <ErrorNotification />

      <span className="brand">
        <strong>Obatala</strong> Curatorial Process Management
      </span>
      <h2>Process Sector Manager</h2>
      <div className="panel-container">
        <main>
          <Panel>
            <PanelBody title="Existing Sectors">
              <div className="sectors-container">
                {sectors.length === 0 ? (
                  <p>No sector created yet.</p>
                ) : (
                  sectors.map((sector) => (
                    <SectorCard
                      key={sector.id}
                      sector={sector}
                      users={users.filter(
                        (user) =>
                          user.meta.sector_ids &&
                          user.meta.sector_ids.includes(sector.id)
                      )}
                      onDelete={handleConfirmDeleteSector}
                      onRemoveUser={handleRemoveUserFromSector}
                    />
                  ))
                )}
              </div>
            </PanelBody>
          </Panel>
        </main>
        <aside>
          <Panel>
            {isLoading && <Spinner />}
            <ConfirmDeleteModal
              isOpen={state.isOpen}
              onConfirm={() => {
                if (state.deleteSector) {
                  handleDeleteSector(state.deleteSector);
                }
                dispatch({ type: "CLOSE_MODAL" });
              }}
              onCancel={handleCancel}
              itemType="setor"
            />

            <PanelBody title="Manage Users & Sectors">
              <AddSectorForm
                onAddSector={handleAddSector}
                isLoading={isLoading}
              />
              <AddUserToSectorForm
                users={users}
                sectors={sectors}
                selectedUser={selectedUser}
                selectedSector={selectedSector}
                onSelectUser={setSelectedUser}
                onSelectSector={setSelectedSector}
                onAddUserToSector={handleAddUserToSector}
                isLoading={isLoading}
                onAlert={setAlert}
              />
              {alert && (
                <Animate type="slide-in">
                  {({ className }) => (
                    <Notice
                      status="warning"
                      onRemove={() => setAlert("")}
                      className={className}
                    >
                      {alert}
                    </Notice>
                  )}
                </Animate>
              )}
            </PanelBody>
          </Panel>
        </aside>
      </div>
    </>
  );
};

export default ProcessSectorManager;
