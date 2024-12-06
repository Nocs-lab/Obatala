import React, { useState, useEffect, useReducer } from 'react';
import {
    Button,
    ButtonGroup,
    Icon,
    Spinner,
    Modal,
    Notice,
    __experimentalConfirmDialog as ConfirmDialog 
} from '@wordpress/components';
import { plus } from "@wordpress/icons";
import { fetchProcessModels, saveProcessType, deleteProcessType, updateProcessTypeMeta } from '../api/apiRequests';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessTypeList from './ProcessTypeManager/ProcessTypeList';
import Reducer, { initialState } from '../redux/reducer';

const ProcessTypeManager = () => {
  const [processTypes, setProcessTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProcessType, setEditingProcessType] = useState(null);
  const [addingProcessType, setAddingProcessType] = useState(null);
  const [notice, setNotice] = useState(null);

  const [state, dispatch] = useReducer(Reducer, initialState)

  useEffect(() => {
      loadProcessTypes();
  }, []);

  const loadProcessTypes = () => {
    setIsLoading(true);
    fetchProcessModels()
      .then(data => {
          const sortedProcessTypes = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
          setProcessTypes(sortedProcessTypes);
          setIsLoading(false);
      })
      .catch(error => {
          console.error('Error fetching process types:', error);
          setIsLoading(false);
      });
  };

  const handleSaveProcessType = async (processType) => {
      setIsLoading(true);
      try {
          let savedProcessType;
          if (editingProcessType) {
              savedProcessType = await saveProcessType(processType, editingProcessType);

          } else {
              savedProcessType = await saveProcessType(processType);
          }
          const meta = {
              description: processType.meta.description || '',
          };

          await updateProcessTypeMeta(savedProcessType.id, meta);

          setNotice({ status: 'success', message: 'Process model saved successfully.' });
          setEditingProcessType(null);
          setAddingProcessType(null);
          loadProcessTypes();
      } catch (error) {
          console.error('Error saving process model:', error);
          setNotice({ status: 'error', message: 'Error saving process model.' });
          setIsLoading(false);
      }
  };

  const handleDeleteProcessType = (processModel) => {
    deleteProcessType(processModel.id)
      .then(() => {
          const updatedProcessTypes = processTypes.filter(type => type.id !== processModel.id);
          setProcessTypes(updatedProcessTypes);
      })
      .catch(error => {
          console.error('Error deleting process type:', error);
      });
  };

  const handleAddProcessType = () => {
    setAddingProcessType(true);
  };

  const handleEditProcessType = (id) => {
    window.location.href = `?page=process-type-editor&process_type_id=${id}`;
  };

  const handleAdd = () => {
    setAddingProcessType(true);
  }

  const handleCancel = () => {
    setEditingProcessType(null);
    setAddingProcessType(null);
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleConfirmDelete = (processModel) => {
    dispatch({type: 'OPEN_MODAL_PROCESS_MODEL', payload: processModel})
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <main>
      <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
      <div className="title-container">
        <h2>Process Models</h2>
        <ButtonGroup>
          <Button 
              variant="primary" 
              icon={<Icon icon={plus} />}
              onClick={handleAdd}
              >Add process model</Button>
        </ButtonGroup>
      </div>
      {notice && (
        <div className="notice-container">
          <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
            {notice.message}
          </Notice>
        </div>
      )}
      <div className="panel-container">
        <main>
            <ConfirmDialog
                isOpen={state.isOpen}
                onConfirm={() => {
                    handleDeleteProcessType(state.processModel);
                    dispatch({type: 'CLOSE_MODAL'})
                }}
                onCancel={ handleCancel }
            >
                Are you sure you want to delete process model {state.processModel?.title.rendered}?
            </ConfirmDialog>

            <ProcessTypeList
                processTypes={processTypes}
                onEdit={handleEditProcessType}
                onDelete={handleConfirmDelete}
            />
        </main>
        {addingProcessType && (
            <Modal
                title="Add process model"
                onRequestClose={handleCancel}
                isDismissible={true}
                size="medium"
            >
                <ProcessTypeForm
                    onSave={handleSaveProcessType}
                    onCancel={handleCancel}
                    editingProcessType={editingProcessType}
                />
            </Modal>
        )}
      </div>
    </main>
  );
};

export default ProcessTypeManager;