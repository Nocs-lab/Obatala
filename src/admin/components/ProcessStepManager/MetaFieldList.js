import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, Tooltip, Notice, Icon, Spinner, Panel, PanelHeader, PanelRow } from "@wordpress/components";
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
            <Panel>
                <PanelHeader>
                    <h3>Metadata fields</h3>
                    <span className="badge">{metaFields.length}</span>
                </PanelHeader>
                <PanelRow>
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
                                                    className="step-item"
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <span className="step-number">{index + 1}</span>
                                                    <h4>{field.title}</h4>
                                                    <dl className="description-list">
                                                        <div className="list-item">
                                                            <dt>Type:</dt><dd>{field.type}</dd>
                                                        </div>
                                                        {field.value && (
                                                            <div className="list-item">
                                                                <dt>Value:</dt><dd>{field.value}</dd>
                                                            </div>
                                                        )}
                                                    </dl>
                                                    <ButtonGroup>
                                                        <Tooltip text="Delete Field">
                                                            <Button
                                                                icon={<Icon icon={trash} />}
                                                                onClick={() => handleDeleteField(index)}
                                                            />
                                                        </Tooltip>
                                                    </ButtonGroup>
                                                </li>
                                            )}
                                        </Draggable>
                                        ))
                                    ) : (
                                        <Notice status="warning">No metadata fields found.</Notice>
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </PanelRow>
            </Panel>
        </>
  );
};

export default MetaFieldList;
