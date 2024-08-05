import React, { useState, useEffect } from "react";
import { Button, Tooltip, Notice, Icon, Spinner, Card, CardBody, CardHeader, CardFooter } from "@wordpress/components";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import apiFetch from "@wordpress/api-fetch";
import { trash, edit } from '@wordpress/icons';

const MetaFieldList = ({ stepId, onNotice }) => {
  const [metaFields, setMetaFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetaFields();
  }, []);

  const fetchMetaFields = () => {
    setIsLoading(true);
    apiFetch({ path: `/obatala/v1/process_step/${stepId}/meta` })
      .then(data => {
        const fields = Array.isArray(data) ? data : [data];
        setMetaFields(fields);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching metadata:', error);
        onNotice({ status: 'error', message: 'Error fetching metadata.' });
        setIsLoading(false);
      });
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedFields = Array.from(metaFields);
    const [movedField] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, movedField);

    setMetaFields(reorderedFields);

    try {
      await apiFetch({
        path: `/obatala/v1/process_step/${stepId}/meta`,
        method: 'POST',
        data: { meta_fields: reorderedFields }
      });
      onNotice({ status: 'success', message: 'Metadata order updated successfully.' });
    } catch (error) {
      console.error('Error updating metadata order:', error);
      onNotice({ status: 'error', message: 'Error updating metadata order.' });
    }
  };

  const handleDeleteField = async (index) => {
    const updatedFields = metaFields.filter((_, fieldIndex) => fieldIndex !== index);

    try {
      await apiFetch({
        path: `/obatala/v1/process_step/${stepId}/meta`,
        method: 'POST',
        data: { meta_fields: updatedFields }
      });

      setMetaFields(updatedFields);
      onNotice({ status: 'success', message: 'Field removed successfully.' });
    } catch (error) {
      console.error('Error removing field:', error);
      onNotice({ status: 'error', message: 'Error removing field.' });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="meta-fields-list">
          {(provided) => (
            <ul
              className="steps-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {metaFields.length > 0 ? (
                metaFields.map((field, index) => (
                  <Draggable key={`${field.title}-${index}`} draggableId={`${field.title}-${index}`} index={index}>
                    {(provided) => (
                      <li
                        className="step-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        
                          <CardHeader>
                            <h4 className="meta-field-title">{field.title}</h4>
                          </CardHeader>
                          <CardBody>
                            <p>Type: {field.type}</p>
                            <p>Value: {field.value}</p>
                          </CardBody>
                          <CardFooter>
                            <Tooltip text="Delete Field">
                              <Button
                                isDestructive
                                icon={<Icon icon={trash} />}
                                onClick={() => handleDeleteField(index)}
                              />
                            </Tooltip>
                          </CardFooter>
                        
                      </li>
                    )}
                  </Draggable>
                ))
              ) : (
                <Notice status="info">No metadata fields found.</Notice>
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default MetaFieldList;
