import React, { useState, useEffect } from "react";
import {
  Button,
  TextControl,
  Panel,
  PanelBody,
  PanelRow,
  Notice,
  Spinner,
  PanelHeader,
} from "@wordpress/components";
import MetadataCreator from "./ProcessStepManager/MetadataCreator";
import MetaFieldList from "./ProcessStepManager/MetaFieldList";
import apiFetch from "@wordpress/api-fetch";

const ProcessStepEditor = () => {
    const params = new URLSearchParams(window.location.search);
    const stepId = params.get("step_id");
    const [stepTitle, setStepTitle] = useState("");
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStepData();
    }, []);

    const fetchStepData = () => {
        setIsLoading(true);
        apiFetch({ path: `/obatala/v1/process_step/${stepId}` })
        .then((data) => {
            setStepTitle(data.title.rendered || "");
            setIsLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching step data:", error);
            setNotice({ status: "error", message: "Error fetching step data." });
            setIsLoading(false);
        });
    };

    const handleSaveStep = () => {
        if (!stepTitle) {
        setNotice({
            status: "error",
            message: "Step Title field cannot be empty.",
        });
        return;
        }

        const requestData = {
        title: stepTitle,
        };

        apiFetch({
        path: `/obatala/v1/process_step/${stepId}`,
        method: "PUT",
        data: requestData,
        })
        .then(() => {
            setNotice({ status: "success", message: "Step updated successfully." });
        })
        .catch((error) => {
            console.error("Error updating process step:", error);
            setNotice({ status: "error", message: "Error updating process step." });
        });
    };

    const handleMetaFieldAdded = (newField) => {
        setNotice({
        status: "success",
        message: "Metadata field added successfully.",
        });
        fetchStepData(); // Atualiza os dados da etapa após adicionar um novo campo de metadados
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Edit Process Step: {stepTitle}</h2>
            <div className="panel-container">
                <main>
                    {notice && (
                        <Notice
                            status={notice.status}
                            isDismissible
                            onRemove={() => setNotice(null)}
                            >
                            {notice.message}
                        </Notice>
                    )}
                    <MetaFieldList stepId={stepId} onNotice={setNotice} />
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>
                            <h3>Manage data</h3>
                        </PanelHeader>
                        <PanelBody title="Edit main data" initialOpen={false}>
                            <PanelRow>
                                <TextControl
                                    label="Step Title"
                                    value={stepTitle}
                                    onChange={(value) => setStepTitle(value)}
                                />
                                <Button isPrimary onClick={handleSaveStep}>
                                    Save
                                </Button>
                            </PanelRow>
                        </PanelBody>
                        <MetadataCreator
                            stepId={stepId}
                            onMetaFieldAdded={handleMetaFieldAdded}
                        />
                    </Panel>
                </aside>
            </div>
        </div>
  );
};

export default ProcessStepEditor;
